import styles from "#/index.css?url";
import entry from "#/entry.browser.tsx?url";
import { Frame, css } from "remix/component";

export function Document() {
    return ({ url }: { url: URL }) => (
        <html
            lang="en"
            mix={css({
                backgroundColor: "var(--color-white)",
                "@media (prefers-color-scheme: dark)": {
                    backgroundColor: "var(--color-gray-950)",
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
                <script async src={entry} type="module" />
            </head>
            <body>
                <Frame name="welcome" src={url.toString()} />
            </body>
        </html>
    );
}
