import type { Program } from "oxc-parser";
import type { PluginOption } from "vite-plus";

import fullstack from "@hiogawa/vite-plugin-fullstack";
import { parseSync } from "oxc-parser";

const CLIENT_ENTRY_PATTERN = /\bclientEntry\b/;

// Rolldown may provide ast and magicString on the transform hook meta at build time,
// but they are not available during dev.
interface RolldownTransformMeta {
    ast: Program;
    magicString: {
        [key: string]: unknown;
        prepend(str: string): void;
        overwrite(start: number, end: number, content: string): void;
    };
}

export function remix({
    clientEntry = "app/entry.browser",
    serverEntry = "app/entry.server",
    serverEnvironments: _environments = ["ssr"],
    serverHandler = true,
}: {
    clientEntry?: string | false;
    serverEntry?: string;
    serverEnvironments?: string[];
    serverHandler?: boolean;
} = {}): PluginOption {
    let environments = new Set(_environments);
    let hasClientEntry = clientEntry !== false;

    return [
        fullstack({
            serverEnvironments: _environments,
            serverHandler,
        }),
        {
            // Patches the builder so remix-build coexists with plugins that also
            // orchestrate builds (e.g. @cloudflare/vite-plugin). Runs at "pre"
            // order so the guards are in place before any building starts.
            name: "remix-build:compat",
            buildApp: {
                order: "pre" as const,
                async handler(builder) {
                    // Guard builder.build() against redundant calls. Without this,
                    // both remix-build and config.builder.buildApp (Cloudflare) would
                    // each trigger a full build of every environment.
                    let originalBuild = builder.build.bind(builder);
                    (builder as unknown as Record<string, unknown>).build = async (
                        environment: Parameters<typeof builder.build>[0],
                    ) => {
                        if ((environment as { isBuilt?: boolean }).isBuilt) return;
                        return originalBuild(environment);
                    };

                    // @cloudflare/vite-plugin moves SSR assets into client output
                    // before fullstack's writeAssetsManifest copies them, causing
                    // ENOENT on files that were already relocated. Safe to ignore.
                    let b = builder as typeof builder & {
                        writeAssetsManifest?: () => Promise<void>;
                    };
                    let originalWrite = b.writeAssetsManifest;
                    if (originalWrite) {
                        b.writeAssetsManifest = async () => {
                            try {
                                await originalWrite();
                            } catch (error) {
                                if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
                            }
                        };
                    }
                },
            },
        },
        {
            name: "remix-build",
            async buildApp(builder) {
                await builder.build(builder.environments.ssr);
                if (hasClientEntry) {
                    await builder.build(builder.environments.client);
                }
            },
            config() {
                return {
                    build: {
                        assetsInlineLimit: 0,
                    },
                    environments: {
                        ...(hasClientEntry && {
                            client: {
                                build: {
                                    outDir: "dist/client",
                                    rollupOptions: {
                                        input: clientEntry || undefined,
                                    },
                                },
                            },
                        }),
                        ssr: {
                            build: {
                                outDir: "dist/ssr",
                                rollupOptions: {
                                    input: { index: serverEntry },
                                },
                            },
                        },
                    },
                };
            },
        },
        {
            name: "remix-preview-server",
            async configurePreviewServer(server) {
                let ssrOutDir = server.config.environments.ssr?.build?.outDir ?? "dist/ssr";
                let entryPath = new URL(`${ssrOutDir}/index.js`, `file://${server.config.root}/`)
                    .href;

                let mod;
                try {
                    mod = await import(/* @vite-ignore */ entryPath);
                } catch {
                    // SSR bundle targets a non-Node runtime (e.g. Cloudflare Workers)
                    // that provides its own preview server. Skip.
                    return;
                }

                let router = mod.default ?? mod.router;
                let { createRequestListener } = await import("remix/node-fetch-server");

                return () => {
                    server.middlewares.use(
                        createRequestListener((request: Request) => router.fetch(request)),
                    );
                };
            },
        },
        {
            // Suppress abort errors from client disconnects (e.g. search-as-you-type)
            // that would otherwise trigger Vite's error overlay.
            name: "remix-suppress-abort-errors",
            configureServer(server) {
                return () => {
                    server.middlewares.use(
                        // @ts-expect-error - connect error handler requires 4 args
                        (err, _req, _res, next) => {
                            if (err?.message === "aborted") return;
                            next(err);
                        },
                    );
                };
            },
        },
        {
            name: "remix-client-entry-transform",
            transform: {
                filter: {
                    code: {
                        include: CLIENT_ENTRY_PATTERN,
                    },
                },
                handler(code, id, _meta) {
                    if (!code.includes("import.meta.url")) return;

                    let meta = _meta as unknown as Partial<RolldownTransformMeta> | undefined;
                    let ast = meta?.ast ?? parseSync(id, code).program;

                    let calls = findClientEntryCalls(ast);
                    if (calls.length === 0) return;

                    let isServer = environments.has(this.environment.name);

                    if (isServer) {
                        // Server: import ?assets=client to get the resolved client entry URL
                        let prepend = `import ___clientEntryAssets from "${id}?assets=client";\n`;

                        if (meta?.magicString) {
                            let { magicString } = meta;
                            magicString.prepend(prepend);
                            for (let call of calls) {
                                magicString.overwrite(
                                    call.metaUrlStart,
                                    call.metaUrlEnd,
                                    `___clientEntryAssets.entry + "#${call.exportName}"`,
                                );
                            }
                            return { code: magicString as unknown as string };
                        }

                        let result = code;
                        for (let call of [...calls].reverse()) {
                            result =
                                result.slice(0, call.metaUrlStart) +
                                `___clientEntryAssets.entry + "#${call.exportName}"` +
                                result.slice(call.metaUrlEnd);
                        }
                        return prepend + result;
                    }

                    // Client: import.meta.url already resolves to the chunk URL.
                    // Just append #ExportName so clientEntry gets the required fragment.
                    let result = code;
                    for (let call of [...calls].reverse()) {
                        result =
                            result.slice(0, call.metaUrlStart) +
                            `import.meta.url + "#${call.exportName}"` +
                            result.slice(call.metaUrlEnd);
                    }
                    return result;
                },
            },
        },
    ];
}

interface ClientEntryCall {
    exportName: string;
    metaUrlStart: number;
    metaUrlEnd: number;
}

function findClientEntryCalls(program: Program): ClientEntryCall[] {
    let results: ClientEntryCall[] = [];

    for (let node of program.body) {
        if (node.type !== "ExportNamedDeclaration") continue;
        if (node.declaration?.type !== "VariableDeclaration") continue;

        for (let declarator of node.declaration.declarations) {
            if (declarator.id.type !== "Identifier") continue;
            if (declarator.init?.type !== "CallExpression") continue;

            let call = declarator.init;

            if (call.callee.type !== "Identifier" || call.callee.name !== "clientEntry") continue;

            if (call.arguments.length < 2) continue;

            let firstArg = call.arguments[0];
            if (
                firstArg.type !== "MemberExpression" ||
                firstArg.object.type !== "MetaProperty" ||
                firstArg.property.type !== "Identifier" ||
                firstArg.property.name !== "url"
            )
                continue;

            results.push({
                exportName: declarator.id.name,
                metaUrlStart: firstArg.start,
                metaUrlEnd: firstArg.end,
            });
        }
    }

    return results;
}
