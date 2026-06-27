import controller from "#/actions/controller.tsx";
import { render } from "#/middleware/render.tsx";
import { routes } from "#/routes.ts";
import { staticFiles } from "remix/middleware/static";
import { type MiddlewareContext, createRouter } from "remix/router";

type AppContext = MiddlewareContext<[ReturnType<typeof render>]>;

declare module "remix/router" {
    interface RouterTypes {
        context: AppContext;
    }
}

export let router = createRouter<AppContext>({
    middleware: [staticFiles("./public"), render()],
});

router.map(routes, controller);

export default router;

if (import.meta.hot) {
    import.meta.hot.accept();
}
