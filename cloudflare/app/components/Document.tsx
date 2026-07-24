import { mergeAssets } from "@pitlane/dev/runtime";
import { getContext } from "remix/middleware/async-context";
import { Frame, css } from "remix/ui";

import { Theme, theme } from "#/components/Theme.tsx";
import clientAssets from "#/entry.browser.ts?assets=client";
import serverAssets from "#/entry.server.tsx?assets=ssr";
import styles from "#/styles/preflight.css?url";

export function Document() {
    let { url } = getContext();
    let assets = mergeAssets(clientAssets, serverAssets);

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
                <link href={styles} rel="stylesheet" />
                {assets.css.map(attrs => (
                    <link key={attrs.href} {...attrs} rel="stylesheet" />
                ))}

                <script async src={clientAssets.entry} type="module" />
                {assets.js.map(attrs => (
                    <link key={attrs.href} {...attrs} rel="modulepreload" />
                ))}
            </head>
            <body>
                <Frame name="welcome" src={url.toString()} />
            </body>
        </html>
    );
}
