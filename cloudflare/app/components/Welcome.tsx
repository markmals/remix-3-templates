import type { GuestBookEntry } from "#/data/schemas.ts";

import { CharacterCounter } from "#/components/CharacterCounter.tsx";
import { routes } from "#/routes.ts";
import { css } from "remix/component";

export function Welcome() {
    return (props: { entries: GuestBookEntry[] }) => (
        <div
            mix={[
                css({
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minHeight: "100vh",
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-gray-900)",
                    padding: "calc(var(--spacing) * 16) calc(var(--spacing) * 4)",
                    "@media (prefers-color-scheme: dark)": {
                        color: "var(--color-gray-100)",
                    },
                }),
            ]}
        >
            <header
                mix={[
                    css({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "calc(var(--spacing) * 4)",
                        maxWidth: "var(--container-lg)",
                    }),
                ]}
            >
                <picture>
                    <source media="(prefers-color-scheme: dark)" srcSet="/remix-3-logo-dark.svg" />
                    <img
                        alt="Remix 3"
                        mix={[css({ height: "calc(var(--spacing) * 10)" })]}
                        src="/remix-3-logo-light.svg"
                    />
                </picture>
                <h1
                    mix={[
                        css({
                            fontSize: "var(--text-4xl)",
                            fontWeight: "var(--font-weight-bold)",
                            letterSpacing: "var(--tracking-tight)",
                        }),
                    ]}
                >
                    Welcome to Remix 3
                </h1>
            </header>

            <nav
                mix={[
                    css({
                        display: "flex",
                        gap: "calc(var(--spacing) * 6)",
                        marginTop: "calc(var(--spacing) * 8)",
                    }),
                ]}
            >
                <ResourceLink href="https://github.com/remix-run/remix" label="GitHub" />
                <ResourceLink href="https://discord.gg/xwx7mMzVkA" label="Discord" />
            </nav>

            <section
                mix={[
                    css({
                        marginTop: "calc(var(--spacing) * 12)",
                        width: "100%",
                        maxWidth: "var(--container-md)",
                    }),
                ]}
            >
                <h2
                    mix={[
                        css({
                            fontSize: "var(--text-xl)",
                            fontWeight: "var(--font-weight-semibold)",
                            marginBottom: "calc(var(--spacing) * 4)",
                        }),
                    ]}
                >
                    Guest Book
                </h2>

                {props.entries.length > 0 && (
                    <ul
                        mix={[
                            css({
                                display: "flex",
                                flexDirection: "column",
                                gap: "calc(var(--spacing) * 3)",
                                marginBottom: "calc(var(--spacing) * 6)",
                            }),
                        ]}
                    >
                        {props.entries.map(entry => (
                            <li
                                key={entry.id}
                                mix={[
                                    css({
                                        padding: "calc(var(--spacing) * 3)",
                                        borderRadius: "var(--radius-lg)",
                                        backgroundColor: "var(--color-gray-50)",
                                        border: "1px solid var(--color-gray-200)",
                                        "@media (prefers-color-scheme: dark)": {
                                            backgroundColor: "var(--color-gray-900)",
                                            border: "1px solid var(--color-gray-800)",
                                        },
                                    }),
                                ]}
                            >
                                <p
                                    mix={[
                                        css({
                                            fontWeight: "var(--font-weight-medium)",
                                            color: "var(--color-gray-900)",
                                            "@media (prefers-color-scheme: dark)": {
                                                color: "var(--color-gray-100)",
                                            },
                                        }),
                                    ]}
                                >
                                    {entry.name}
                                </p>
                                <p
                                    mix={[
                                        css({
                                            color: "var(--color-gray-600)",
                                            fontSize: "var(--text-sm)",
                                            marginTop: "calc(var(--spacing) * 1)",
                                            "@media (prefers-color-scheme: dark)": {
                                                color: "var(--color-gray-400)",
                                            },
                                        }),
                                    ]}
                                >
                                    {entry.message}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                <form
                    action={routes.guestBook.action.href()}
                    method={routes.guestBook.action.method}
                    mix={[
                        css({
                            display: "flex",
                            flexDirection: "column",
                            gap: "calc(var(--spacing) * 3)",
                        }),
                    ]}
                >
                    <input
                        mix={[
                            css({
                                padding: "calc(var(--spacing) * 2) calc(var(--spacing) * 3)",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--color-gray-300)",
                                fontSize: "var(--text-sm)",
                                "&:focus": {
                                    outline: "2px solid var(--color-blue-500)",
                                    outlineOffset: "-1px",
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "var(--color-gray-900)",
                                    border: "1px solid var(--color-gray-700)",
                                    color: "var(--color-gray-100)",
                                    "&:focus": {
                                        outline: "2px solid var(--color-blue-400)",
                                    },
                                },
                            }),
                        ]}
                        name="name"
                        placeholder="Your name"
                        required
                    />
                    <CharacterCounter />
                    <button
                        mix={[
                            css({
                                alignSelf: "flex-start",
                                padding: "calc(var(--spacing) * 2) calc(var(--spacing) * 4)",
                                borderRadius: "var(--radius-md)",
                                backgroundColor: "var(--color-blue-600)",
                                color: "var(--color-white)",
                                fontSize: "var(--text-sm)",
                                fontWeight: "var(--font-weight-medium)",
                                cursor: "pointer",
                                "&:hover": {
                                    backgroundColor: "var(--color-blue-700)",
                                },
                                "@media (prefers-color-scheme: dark)": {
                                    backgroundColor: "var(--color-blue-500)",
                                    "&:hover": {
                                        backgroundColor: "var(--color-blue-600)",
                                    },
                                },
                            }),
                        ]}
                        rmx-target="welcome"
                        type="submit"
                    >
                        Sign
                    </button>
                </form>
            </section>
        </div>
    );
}

function ResourceLink() {
    return (props: { href: string; label: string }) => (
        <a
            href={props.href}
            target="_blank"
            mix={[
                css({
                    color: "var(--color-blue-600)",
                    fontSize: "var(--text-base)",
                    fontWeight: "var(--font-weight-medium)",
                    "&:hover": {
                        color: "var(--color-blue-800)",
                    },
                    "@media (prefers-color-scheme: dark)": {
                        color: "var(--color-blue-400)",
                        "&:hover": {
                            color: "var(--color-blue-300)",
                        },
                    },
                }),
            ]}
        >
            {props.label}
        </a>
    );
}
