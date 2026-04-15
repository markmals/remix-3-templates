import type { RemixNode } from "remix/component";

import { router } from "#/entry.server.tsx";
import { getContext } from "remix/async-context-middleware";
import { renderToStream } from "remix/component/server";
import { createHtmlResponse as html } from "remix/response/html";

export function render(node: RemixNode): Response {
    let context = getContext();
    return html(
        renderToStream(node, {
            frameSrc: context.url,
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
        }),
    );
}

export function frame(node: RemixNode): Response {
    return new Response(renderToStream(node), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
