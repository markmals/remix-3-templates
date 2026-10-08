import { type Handle, type RemixNode, css } from "remix/component";

import { stylesheetHref, stylesheets } from "#/assets.ts";

export interface DocumentProps {
    children?: RemixNode;
}

export function Document(handle: Handle<DocumentProps>) {
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

                    <link href={stylesheetHref} rel="stylesheet" />
                    {stylesheets.map(href => (
                        <link href={href} key={href} rel="stylesheet" />
                    ))}
                </head>
                <body>{children}</body>
            </html>
        );
    };
}
