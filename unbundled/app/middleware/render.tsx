import type { RemixNode } from "remix/ui";

import { assetServer } from "#/utils/assets.ts";
import * as path from "node:path";
import { assert } from "remix/assert";
import { renderWith } from "remix/middleware/render";
import { createHtmlResponse } from "remix/response/html";
import { renderToStream } from "remix/ui/server";

export function render() {
    return renderWith(
        context =>
            function render(node: RemixNode, init?: ResponseInit) {
                let stream = renderToStream(node, {
                    frameSrc: context.url,
                    async resolveClientEntry(entryId, component) {
                        assert(
                            entryId.startsWith("file://"),
                            `Expected \`import.meta.url\` for clientEntry ID, received '${entryId}'`,
                        );

                        let [filePath, fragment] = entryId.split("#");

                        return {
                            href: await assetServer.getHref(filePath),
                            exportName: fragment || component.name || titleCaseFileName(filePath),
                        };
                    },
                    async resolveFrame(src, target, frame) {
                        let url = new URL(src, frame?.currentFrameSrc ?? context.url);
                        let headers = new Headers({ accept: "text/html" });
                        if (target) headers.set("x-remix-target", target);

                        let response = await context.router.fetch(new Request(url, { headers }));
                        if (!response.ok) {
                            throw new Error(`Failed to resolve frame ${url.pathname}`);
                        }

                        return response.body ?? (await response.text());
                    },
                });

                return createHtmlResponse(stream, init);
            },
    );
}

function titleCaseFileName(fileUrl: string): string {
    let url = new URL(fileUrl);
    let fileName = path.basename(url.pathname, path.extname(url.pathname));
    return fileName
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map(segment => segment[0]!.toUpperCase() + segment.slice(1))
        .join("");
}
