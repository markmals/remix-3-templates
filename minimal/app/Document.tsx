import { mergeAssets } from "@pitlane/dev/runtime";
import { type Handle, type RemixNode, css } from "remix/ui";

import serverAssets from "./entry.server.tsx?assets=ssr";
import styles from "./index.css?url";

export interface DocumentProps {
    children?: RemixNode;
}

export function Document(handle: Handle<DocumentProps>) {
    let assets = mergeAssets(serverAssets);

    return () => {
        let { children } = handle.props;

        return (
            <html
                lang="en"
                mix={css({
                    backgroundColor: "white",
                    "@media (prefers-color-scheme: dark)": {
                        backgroundColor: "oklch(13% 0.028 261.692)",
                    },
                })}
            >
                <head>
                    <meta charSet="utf-8" />
                    <meta content="width=device-width, initial-scale=1" name="viewport" />
                    <title>New Remix App</title>

                    <link href="/favicon.ico" rel="icon" sizes="32x32" type="image/x-icon" />
                    <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />

                    <link href={styles} rel="stylesheet" />
                    {assets.css.map(attrs => (
                        <link key={attrs.href} {...attrs} rel="stylesheet" />
                    ))}
                </head>
                <body>{children}</body>
            </html>
        );
    };
}
