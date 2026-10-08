import { ASSETS_BASE } from "#/routes.ts";
import { createAssetServer } from "remix/assets";

let isDevelopment = process.env.NODE_ENV === "development";

export let assetServer = createAssetServer({
    basePath: ASSETS_BASE,
    rootDir: process.cwd(),
    mounts: {
        app: "app",
        node_modules: "node_modules",
    },
    // `theme.tsx` and `controls.ts` are shared by server-rendered components and
    // the browser modules under `app/assets`, so they have to be reachable too.
    allowFiles: [`app${ASSETS_BASE}/**/*`, "app/controls.ts", "app/theme.tsx", "node_modules/**"],
    denyFiles: ["app/**/*.server.*", "app/entry.server.*"],
    sourceMaps: isDevelopment ? "external" : undefined,
    minify: !isDevelopment,
    scripts: {
        define: {
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
        },
    },
});
