import type { RemixNode } from "remix/ui";

import { router } from "#/entry.server.tsx";
import { getContext } from "remix/middleware/async-context";
import { isSafeHtml, type SafeHtml } from "remix/html-template";
import { renderToStream } from "remix/ui/server";

export function render(node: RemixNode): ReadableStream<Uint8Array> {
    let context = getContext();
    return renderToStream(node, {
        frameSrc: context.url,
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
