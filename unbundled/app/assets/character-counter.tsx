import { theme } from "#/theme.tsx";
import { Handle } from "remix/ui";
import { clientEntry, css, on } from "remix/ui";
import { inputStyle } from "remix/ui/combobox";

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
                            inputStyle,
                            css({
                                paddingBlock: theme.space.sm,
                                resize: "vertical",
                                boxShadow:
                                    "inset 0 1px 0 light-dark(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.04))",
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
