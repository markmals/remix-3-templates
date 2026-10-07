import { Frame, css } from "remix/component";
import { ImportMap } from "remix/component/server";
import { getContext } from "remix/middleware/async-context";

import { scriptEntry, stylesheetHref, stylesheets } from "#/assets.ts";
import { Theme, theme } from "#/components/Theme.tsx";

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
                <link href={stylesheetHref} rel="stylesheet" />
                {stylesheets.map(href => (
                    <link href={href} key={href} rel="stylesheet" />
                ))}

                <ImportMap value={scriptEntry.importMap} />
                {scriptEntry.preloads.map(href => (
                    <link href={href} key={href} rel="modulepreload" />
                ))}
                <script async src={scriptEntry.href} type="module" />
            </head>
            <body>
                <Frame name="welcome" src={url.toString()} />
            </body>
        </html>
    );
}
