import devtoolsJson from "vite-plugin-devtools-json";
import { defineConfig, loadEnv } from "vite-plus";

import { remix } from "./remix.plugin.ts";

let env = loadEnv("development", process.cwd(), "");

export default defineConfig({
    plugins: [remix(), devtoolsJson()],
    define: {
        "process.env": JSON.stringify(env),
    },
    css: {
        transformer: "lightningcss",
    },
    run: {
        tasks: {
            dev: {
                dependsOn: ["db:migrate"],
                command: "vp dev --host",
                cache: false,
            },
            "db:migrate": {
                command: "node --env-file=.env db/migrate.ts",
            },
            "db:reset": {
                command: "rm -rf db/data.db",
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
