import guestBook from "#/actions/guest-book.tsx";
import { loadDatabase } from "#/middleware/database.ts";
import { render } from "#/middleware/render.tsx";
import { routes } from "#/routes.ts";
import { asyncContext } from "remix/middleware/async-context";
import { formData } from "remix/middleware/form-data";
import { staticFiles } from "remix/middleware/static";
import { type MiddlewareContext, createRouter } from "remix/router";

type AppContext = MiddlewareContext<
    [ReturnType<typeof formData>, ReturnType<typeof loadDatabase>, ReturnType<typeof render>]
>;

declare module "remix/router" {
    interface RouterTypes {
        context: AppContext;
    }
}

export let router = createRouter<AppContext>({
    middleware: [
        staticFiles("./public"),
        staticFiles("./dist/client"),
        formData(),
        asyncContext(),
        loadDatabase(),
        render(),
    ],
});

router.map(routes.guestBook, guestBook);

export default router;

if (import.meta.hot) {
    import.meta.hot.accept();
}
