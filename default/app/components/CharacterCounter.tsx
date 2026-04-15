import { clientEntry, css, on } from "remix/component";

const MAX_LENGTH = 280;

export let CharacterCounter = clientEntry(import.meta.url, handle => {
    let count = 0;

    return () => {
        let remaining = MAX_LENGTH - count;

        return (
            <div
                mix={[
                    css({
                        display: "flex",
                        flexDirection: "column",
                        gap: "calc(var(--spacing) * 1)",
                    }),
                ]}
            >
                <textarea
                    maxLength={MAX_LENGTH}
                    mix={[
                        on("input", event => {
                            count = event.currentTarget.value.length;
                            handle.update();
                        }),
                        css({
                            padding: "calc(var(--spacing) * 2) calc(var(--spacing) * 3)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-gray-300)",
                            fontSize: "var(--text-sm)",
                            resize: "vertical",
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
                    name="message"
                    placeholder="Leave a message..."
                    required
                    rows={3}
                />
                <p
                    data-warning={remaining <= 20 ? "" : undefined}
                    mix={[
                        css({
                            fontSize: "var(--text-xs)",
                            color: "var(--color-gray-400)",
                            textAlign: "right",
                            "&[data-warning]": {
                                color: "var(--color-red-500)",
                            },
                            "@media (prefers-color-scheme: dark)": {
                                color: "var(--color-gray-500)",
                                "&[data-warning]": {
                                    color: "var(--color-red-400)",
                                },
                            },
                        }),
                    ]}
                >
                    {remaining} / {MAX_LENGTH}
                </p>
            </div>
        );
    };
});
