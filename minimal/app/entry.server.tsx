import controller from "#/actions/controller.tsx";
import { routes } from "#/routes.ts";
import { staticFiles } from "remix/middleware/static";
import { createRouter } from "remix/router";

export let router = createRouter({
    middleware: [staticFiles("./public")],
});

router.map(routes, controller);

export default router;

if (import.meta.hot) {
    import.meta.hot.accept();
}
