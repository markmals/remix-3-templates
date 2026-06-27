import type { GuestBookEntry } from "#/data/schemas.ts";

import { CharacterCounter } from "#/assets/character-counter.tsx";
import { routes } from "#/routes.ts";
import { css, type Handle } from "remix/ui";
import { Button } from "remix/ui/button";
import { inputStyle } from "remix/ui/combobox";
import { theme } from "remix/ui/theme";

export interface WelcomeProps {
    entries: GuestBookEntry[];
}

export function Welcome(handle: Handle<WelcomeProps>) {
    return () => {
        let { entries } = handle.props;

        return (
            <div
                mix={[
                    css({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minHeight: "100vh",
                        fontFamily: theme.fontFamily.sans,
                        color: theme.colors.text.primary,
                        padding: "4rem 1rem",
                    }),
                ]}
            >
                <header
                    mix={[
                        css({
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: theme.space.xl,
                            maxWidth: "32rem",
                        }),
                    ]}
                >
                    <picture>
                        <source
                            media="(prefers-color-scheme: dark)"
                            srcSet="/remix-3-logo-dark.svg"
                        />
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
                                fontWeight: theme.fontWeight.bold,
                                letterSpacing: theme.letterSpacing.tight,
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
                            gap: theme.space.xxl,
                            marginTop: "2rem",
                        }),
                    ]}
                >
                    <ResourceLink href="https://github.com/remix-run/remix" label="GitHub" />
                    <ResourceLink href="https://discord.gg/xwx7mMzVkA" label="Discord" />
                </nav>

                <section
                    mix={[
                        css({
                            marginTop: "3rem",
                            width: "100%",
                            maxWidth: "28rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2rem",
                        }),
                    ]}
                >
                    <div
                        mix={css({
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                        })}
                    >
                        <h2
                            mix={css({
                                fontSize: theme.fontSize.xl,
                                fontWeight: theme.fontWeight.semibold,
                            })}
                        >
                            Guest Book
                        </h2>
                        {entries.length > 0 && (
                            <ul
                                mix={[
                                    css({
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: theme.space.lg,
                                    }),
                                ]}
                            >
                                {entries.map(entry => (
                                    <li
                                        key={entry.id}
                                        mix={[
                                            css({
                                                padding: theme.space.lg,
                                                borderRadius: theme.radius.lg,
                                                backgroundColor: theme.surface.lvl1,
                                                border: `1px solid ${theme.colors.border.subtle}`,
                                            }),
                                        ]}
                                    >
                                        <p
                                            mix={[
                                                css({
                                                    fontWeight: theme.fontWeight.medium,
                                                    color: theme.colors.text.primary,
                                                }),
                                            ]}
                                        >
                                            {entry.name}
                                        </p>
                                        <p
                                            mix={[
                                                css({
                                                    color: theme.colors.text.muted,
                                                    fontSize: theme.fontSize.sm,
                                                    marginTop: theme.space.sm,
                                                }),
                                            ]}
                                        >
                                            {entry.message}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <form
                        action={routes.guestBook.action.href()}
                        method={routes.guestBook.action.method}
                        mix={[
                            css({
                                display: "flex",
                                flexDirection: "column",
                                gap: theme.space.lg,
                            }),
                        ]}
                    >
                        <input
                            mix={[
                                inputStyle,
                                css({
                                    boxShadow:
                                        "inset 0 1px 0 light-dark(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.04))",
                                }),
                            ]}
                            name="name"
                            placeholder="Your name"
                            required
                        />
                        <CharacterCounter />
                        <Button
                            mix={css({ alignSelf: "flex-end" })}
                            rmx-target="welcome"
                            tone="primary"
                            type="submit"
                        >
                            Sign
                        </Button>
                    </form>
                </section>
            </div>
        );
    };
}

interface ResourceLinkProps {
    href: string;
    label: string;
}

function ResourceLink(handle: Handle<ResourceLinkProps>) {
    return () => {
        let { href, label } = handle.props;

        return (
            <a
                href={href}
                mix={[
                    css({
                        color: theme.colors.text.link,
                        fontSize: theme.fontSize.md,
                        fontWeight: theme.fontWeight.medium,
                        "&:hover": {
                            color: "light-dark(#1e40af, #93c5fd)",
                        },
                    }),
                ]}
                target="_blank"
            >
                {label}
            </a>
        );
    };
}
