import type { Controller } from "remix/fetch-router";

import { Document } from "./Document.tsx";
import { routes } from "#/routes.ts";
import { css } from "remix/component";
import { renderToStream } from "remix/component/server";
import { createHtmlResponse as html } from "remix/response/html";

function Home() {
    return () => (
        <div
            mix={[
                css({
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    fontFamily: "'Inter var', ui-sans-serif, system-ui, sans-serif",
                    color: "oklch(21% 0.034 264.665)",
                    gap: "1rem",
                    "@media (prefers-color-scheme: dark)": {
                        color: "oklch(96.7% 0.003 264.542)",
                    },
                }),
            ]}
        >
            <picture>
                <source media="(prefers-color-scheme: dark)" srcSet="/remix-3-logo-dark.svg" />
                <img
                    alt="Remix 3"
                    mix={[css({ height: "2.5rem" })]}
                    src="/remix-3-logo-light.svg"
                />
            </picture>
            <h1
                mix={[
                    css({
                        fontSize: "2.25rem",
                        fontWeight: 700,
                        letterSpacing: "-0.025em",
                    }),
                ]}
            >
                Remix 3
            </h1>
            <a
                href="https://github.com/remix-run/remix"
                target="_blank"
                mix={[
                    css({
                        marginTop: "1rem",
                        color: "oklch(54.6% 0.245 262.881)",
                        fontSize: "1.125rem",
                        "&:hover": {
                            color: "oklch(42.4% 0.199 265.638)",
                        },
                        "@media (prefers-color-scheme: dark)": {
                            color: "oklch(70.7% 0.165 254.624)",
                            "&:hover": {
                                color: "oklch(80.9% 0.105 251.813)",
                            },
                        },
                    }),
                ]}
            >
                View the repo →
            </a>
        </div>
    );
}

export default {
    actions: {
        async home() {
            return html(
                renderToStream(
                    <Document>
                        <Home />
                    </Document>,
                ),
            );
        },
    },
} satisfies Controller<typeof routes>;
