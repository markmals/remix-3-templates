import { asyncContext } from "remix/middleware/async-context";
import { formData } from "remix/middleware/form-data";
import { render } from "remix/middleware/render";
import { staticFiles } from "remix/middleware/static";
import { type MiddlewareContext, createRouter } from "remix/router";

import guestBook from "#/actions/guest-book.tsx";
import { assets } from "#/assets.ts";
import { loadDatabase } from "#/middleware/database.ts";
import { routes } from "#/routes.ts";

type AppContext = MiddlewareContext<
    [ReturnType<typeof formData>, ReturnType<typeof loadDatabase>, ReturnType<typeof render>]
>;

declare module "remix" {
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
        render({ assets }),
    ],
});

router.map(routes.guestBook, guestBook);

export default router;

if (import.meta.hot) {
    import.meta.hot.accept();
}
