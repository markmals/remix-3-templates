import { field } from "#/controls.ts";
import { theme } from "#/theme.tsx";
import { Handle } from "remix/component";
import { clientEntry, css, on } from "remix/component";

const MAX_LENGTH = 280;

export let CharacterCounter = clientEntry(
    import.meta.url,
    function CharacterCounter(handle: Handle) {
        let count = 0;

        return () => {
            let remaining = MAX_LENGTH - count;

            return (
                <div
                    mix={[
                        css({
                            display: "flex",
                            flexDirection: "column",
                            gap: theme.space.sm,
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
                            field,
                            css({
                                paddingBlock: theme.space.sm,
                                resize: "vertical",
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
                                fontSize: theme.fontSize.xs,
                                color: theme.colors.text.muted,
                                textAlign: "right",
                                "&[data-warning]": {
                                    color: "light-dark(#ef4444, #f87171)",
                                },
                            }),
                        ]}
                    >
                        {remaining} / {MAX_LENGTH}
                    </p>
                </div>
            );
        };
    },
);
