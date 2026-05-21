import guestBook from "#/actions/guest-book/guest-book.tsx";
import { database } from "#/middleware.ts";
import { routes } from "#/routes.ts";
import { createAssetServer } from "remix/assets";
import { asyncContext } from "remix/middleware/async-context";
import { formData } from "remix/middleware/form-data";
import { staticFiles } from "remix/middleware/static";
import { createRouter } from "remix/router";

export let assets = createAssetServer({
    basePath: "/assets",
    rootDir: process.cwd(),
    fileMap: {
        "app/*path": "app/*path",
        "node_modules/*path": "node_modules/*path",
    },
    allow: ["app/assets/**/*", "node_modules/**"],
    deny: ["app/**/*.server.*", "app/entry.server.*"],
    sourceMaps: process.env.NODE_ENV === "development" ? "external" : undefined,
    scripts: {
        define: {
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
        },
    },
});

export let router = createRouter({
    middleware: [staticFiles("./public"), formData(), asyncContext(), database()],
});

router.map(routes.assets, async ({ request }) => {
    return (await assets.fetch(request)) ?? new Response("Not Found", { status: 404 });
});

router.map(routes.guestBook, guestBook);

export default router;
