import { formData } from "remix/middleware/form-data";
import { render } from "remix/middleware/render";
import { type MiddlewareContext, createRouter } from "remix/router";

import guestBook from "#/actions/guest-book.tsx";
import { assets } from "#/assets.ts";
import { loadStorage } from "#/middleware/storage.ts";
import { routes } from "#/routes.ts";

type AppContext = MiddlewareContext<
    [ReturnType<typeof formData>, ReturnType<typeof loadStorage>, ReturnType<typeof render>]
>;

declare module "remix" {
    interface RouterTypes {
        context: AppContext;
    }
}

export let router = createRouter<AppContext>({
    middleware: [formData(), loadStorage(), render({ assets })],
});

router.map(routes.guestBook, guestBook);
