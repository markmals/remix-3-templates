import guestBook from "#/controllers/guest-book.tsx";
import { database } from "#/middleware.ts";
import { routes } from "#/routes.ts";
import { asyncContext } from "remix/async-context-middleware";
import { createRouter } from "remix/fetch-router";
import { formData } from "remix/form-data-middleware";
import { staticFiles } from "remix/static-middleware";

export let router = createRouter({
    middleware: [
        staticFiles("./public"),
        staticFiles("./dist/client"),
        formData(),
        asyncContext(),
        database(),
    ],
});

router.map(routes.guestBook, guestBook);

export default router;

if (import.meta.hot) {
    import.meta.hot.accept();
}
