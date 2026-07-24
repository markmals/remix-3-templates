import { formData } from "remix/middleware/form-data";
import { type MiddlewareContext, createRouter } from "remix/router";

import guestBook from "#/actions/guest-book.tsx";
import { render } from "#/middleware/render.tsx";
import { loadStorage } from "#/middleware/storage.ts";
import { routes } from "#/routes.ts";

type AppContext = MiddlewareContext<
    [ReturnType<typeof formData>, ReturnType<typeof loadStorage>, ReturnType<typeof render>]
>;

declare module "remix/router" {
    interface RouterTypes {
        context: AppContext;
    }
}

export let router = createRouter<AppContext>({
    middleware: [formData(), loadStorage(), render()],
});

router.map(routes.guestBook, guestBook);
