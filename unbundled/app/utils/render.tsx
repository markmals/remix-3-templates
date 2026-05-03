import type { RemixNode } from "remix/ui";

import { assets, router } from "#/router.tsx";
import path from "node:path";
import { assert } from "remix/assert";
import { getContext } from "remix/async-context-middleware";
import { isSafeHtml, type SafeHtml } from "remix/html-template";
import { renderToStream } from "remix/ui/server";

export function render(node: RemixNode): ReadableStream<Uint8Array> {
    let context = getContext();
    return renderToStream(node, {
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
            if (target) headers.set("x-remix-target", target);
            let response = await router.fetch(new Request(url, { headers }));

            if (!response.ok) {
                throw new Error(`Failed to resolve frame ${url.pathname}`);
            }

            return response.body ?? (await response.text());
        },
    });
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

type HtmlBody = string | SafeHtml | Blob | BufferSource | ReadableStream<Uint8Array>;

export function createFrameResponse(body: HtmlBody, init?: ResponseInit): Response {
    if (isSafeHtml(body)) {
        body = String(body);
    }

    return new Response(body, {
        ...(init ? init : {}),
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}

export { createFrameResponse as frame };
