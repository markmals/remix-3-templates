import { getAssetEntry } from "#/middleware/asset-entry.ts";
import { Theme, theme } from "#/theme.tsx";
import { getContext } from "remix/middleware/async-context";
import { Frame, css } from "remix/ui";

export function Document() {
    let { url } = getContext();

    return () => {
        let { scriptSrc, scriptPreloads, stylesheetHref } = getAssetEntry();

        return (
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
                    <link href={stylesheetHref} rel="stylesheet" />
                    {scriptPreloads.map(href => (
                        <link href={href} key={href} rel="modulepreload" />
                    ))}

                    <script async src={scriptSrc} type="module" />
                </head>
                <body>
                    <Frame name="welcome" src={url.toString()} />
                </body>
            </html>
        );
    };
}
