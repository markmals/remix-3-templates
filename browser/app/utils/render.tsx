import { router } from "#/router.ts";
import type { RemixNode } from "remix/component";

import { renderToStream } from "remix/component/server";
import { createHtmlResponse as html } from "remix/response/html";

export function render(node: RemixNode, url: URL): Response {
    return html(
        renderToStream(node, {
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
        }),
    );
}

export function frame(node: RemixNode): Response {
    return new Response(renderToStream(node), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
