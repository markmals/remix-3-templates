import { routes } from "#/routes.ts";
import { Theme } from "#/theme.tsx";
import { getContext } from "remix/async-context-middleware";
import { Frame, css } from "remix/ui";
import { theme } from "remix/ui/theme";

export function Document() {
    let { url } = getContext();

    return () => (
        <html
            lang="en"
            mix={css({
                backgroundColor: theme.surface.lvl0,
            })}
        >
            <head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1" name="viewport" />
                <title>New Remix App</title>

                <link href="/favicon.ico" rel="icon" sizes="32x32" type="image/x-icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />

                <Theme />
                <link
                    href={routes.assets.href({ path: "app/assets/preflight.css" })}
                    rel="stylesheet"
                />

                <script
                    async
                    src={routes.assets.href({ path: "app/assets/entry.ts" })}
                    type="module"
                />
            </head>
            <body>
                <Frame name="welcome" src={url.toString()} />
            </body>
        </html>
    );
}
