import type { RemixNode } from "remix/ui";
import type { RenderToStreamOptions } from "remix/ui/server";

import { assets, router } from "#/entry.server.tsx";
import path from "node:path";
import { assert } from "remix/assert";
import { getContext } from "remix/async-context-middleware";
import { createHtmlResponse as html } from "remix/response/html";
import { renderToStream } from "remix/ui/server";

export function render(node: RemixNode): Response {
    return html(renderToStream(node, streamOptions()));
}

export function frame(node: RemixNode): Response {
    return new Response(renderToStream(node, streamOptions()), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}

function streamOptions(): RenderToStreamOptions {
    let context = getContext();

    return {
        frameSrc: context.url,
        async resolveClientEntry(entryId, component) {
            assert(
                entryId.startsWith("file://"),
                `Expected \`import.meta.url\` for clientEntry ID, received '${entryId}'`,
            );

            let [filePath, fragment] = entryId.split("#");

            return {
                href: await assets.getHref(filePath),
                exportName: fragment || component.name || titleCaseFileName(filePath),
            };
        },
        async resolveFrame(src, target, ctx) {
            let url = new URL(src, ctx?.currentFrameSrc ?? context.url);
            let headers = new Headers({ accept: "text/html" });
            if (target) headers.set("x-remix-frame", target);
            let response = await router.fetch(new Request(url, { headers }));

            if (!response.ok) {
                throw new Error(`Failed to resolve frame ${url.pathname}`);
            }

            return response.body ?? (await response.text());
        },
    };
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
