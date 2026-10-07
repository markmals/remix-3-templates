import type { RemixNode } from "remix/component";

import { renderToStream } from "remix/component/server";
import { renderWith } from "remix/middleware/render";
import { createHtmlResponse } from "remix/response/html";

export function render() {
    return renderWith(
        () =>
            function render(node: RemixNode, init?: ResponseInit) {
                return createHtmlResponse(renderToStream(node), init);
            },
    );
}
