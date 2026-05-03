import type { RemixNode } from "remix/ui";

import { router } from "#/router.ts";
import { isSafeHtml, SafeHtml } from "remix/html-template";
import { renderToStream } from "remix/ui/server";

export function render(node: RemixNode, url: URL) {
    return renderToStream(node, {
        frameSrc: url,
        async resolveFrame(src, target, ctx) {
            let frameUrl = new URL(src, ctx?.currentFrameSrc ?? url);
            let headers = new Headers({ accept: "text/html" });
            if (target) headers.set("x-remix-frame", target);
            let response = await router.fetch(new Request(frameUrl, { headers }));

            if (!response.ok) {
                throw new Error(`Failed to resolve frame ${frameUrl.pathname}`);
            }

            return response.body ?? (await response.text());
        },
    });
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
