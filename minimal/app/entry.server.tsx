import { routes } from "#/routes.ts";
import home from "./home.tsx";
import { createRouter } from "remix/fetch-router";
import { staticFiles } from "remix/static-middleware";

export let router = createRouter({
    middleware: [staticFiles("./public")],
});

router.map(routes, home);

export default router;

if (import.meta.hot) {
    import.meta.hot.accept();
}
