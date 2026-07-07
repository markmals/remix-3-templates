import { assetsBase } from "#/routes.ts";
import { createAssetServer } from "remix/assets";

let isDevelopment = process.env.NODE_ENV === "development";

export let assetServer = createAssetServer({
    basePath: assetsBase,
    rootDir: process.cwd(),
    fileMap: {
        "app/*path": "app/*path",
        "node_modules/*path": "node_modules/*path",
    },
    allow: ["app/assets/**/*", "node_modules/**"],
    deny: ["app/**/*.server.*", "app/entry.server.*"],
    sourceMaps: isDevelopment ? "external" : undefined,
    minify: !isDevelopment,
    scripts: {
        define: {
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
        },
    },
});
