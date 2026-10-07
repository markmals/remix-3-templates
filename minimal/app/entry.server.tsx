import { render } from "remix/middleware/render";
import { staticFiles } from "remix/middleware/static";
import { type MiddlewareContext, createRouter } from "remix/router";

import controller from "#/actions/controller.tsx";
import { assets } from "#/assets.ts";
import { routes } from "#/routes.ts";

type AppContext = MiddlewareContext<[ReturnType<typeof render>]>;

declare module "remix" {
    interface RouterTypes {
        context: AppContext;
    }
}

export let router = createRouter<AppContext>({
    middleware: [staticFiles("./public"), render({ assets })],
});

router.map(routes, controller);

export default router;

if (import.meta.hot) {
    import.meta.hot.accept();
}
