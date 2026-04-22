import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig } from "vite-plus";

import { remix } from "./remix.plugin.ts";

export default defineConfig({
    plugins: [
        remix({
            clientEntry: "app/entry.browser",
            serverEntry: "app/entry.worker",
            serverHandler: false,
        }),
        devtoolsJson(),
    ],
    server: {
        headers: {
            "Service-Worker-Allowed": "/",
        },
    },
    preview: {
        headers: {
            "Service-Worker-Allowed": "/",
        },
    },
    css: {
        transformer: "lightningcss",
    },
    run: {
        tasks: {
            dev: {
                command: "vp dev --host",
                cache: false,
            },
            typecheck: {
                command: "tsgo --noEmit",
                cache: false,
            },
        },
    },
    fmt: {
        ignorePatterns: ["dist/**"],
        printWidth: 100,
        tabWidth: 4,
        arrowParens: "avoid",
        sortPackageJson: true,
        sortImports: {
            groups: [
                "type-import",
                ["value-builtin", "value-external"],
                "type-internal",
                "value-internal",
                ["type-parent", "type-sibling", "type-index"],
                ["value-parent", "value-sibling", "value-index"],
                "unknown",
            ],
            partitionByComment: true,
        },
    },
    lint: {
        ignorePatterns: ["dist/**"],
        options: {
            typeAware: true,
            typeCheck: true,
        },
        jsPlugins: ["eslint-plugin-perfectionist"],
        rules: {
            "typescript/no-floating-promises": "allow",
            "perfectionist/sort-jsx-props": "warn",
        },
    },
});
