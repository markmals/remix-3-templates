import guestBook from "#/actions/guest-book/guest-book.tsx";
import { loadAssetEntry } from "#/middleware/asset-entry.ts";
import { loadDatabase } from "#/middleware/database.ts";
import { render } from "#/middleware/render.tsx";
import { routes } from "#/routes.ts";
import { assetServer } from "#/utils/assets.ts";
import { asyncContext } from "remix/middleware/async-context";
import { formData } from "remix/middleware/form-data";
import { staticFiles } from "remix/middleware/static";
import { type MiddlewareContext, createRouter } from "remix/router";

type AppContext = MiddlewareContext<
    [
        ReturnType<typeof formData>,
        ReturnType<typeof loadDatabase>,
        ReturnType<typeof loadAssetEntry>,
        ReturnType<typeof render>,
    ]
>;

declare module "remix/router" {
    interface RouterTypes {
        context: AppContext;
    }
}

export let router = createRouter<AppContext>({
    middleware: [
        staticFiles("./public"),
        formData(),
        asyncContext(),
        loadDatabase(),
        loadAssetEntry(),
        render(),
    ],
});

router.map(routes.assets, async ({ request }) => {
    return (await assetServer.fetch(request)) ?? new Response("Not Found", { status: 404 });
});

router.map(routes.guestBook, guestBook);

export default router;
