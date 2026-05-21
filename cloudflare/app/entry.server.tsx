import guestBook from "#/actions/guest-book.tsx";
import { database } from "#/middleware.ts";
import { routes } from "#/routes.ts";
import { asyncContext } from "remix/middleware/async-context";
import { formData } from "remix/middleware/form-data";
import { staticFiles } from "remix/middleware/static";
import { createRouter } from "remix/router";

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
