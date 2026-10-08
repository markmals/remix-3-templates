import { theme } from "#/theme.tsx";
import { css } from "remix/component";

/**
 * Shared control styling, built from the app's own tokens.
 *
 * Remix 3 removed the styled `button()` and `inputStyle` mixins that used to
 * ship with the framework, so the app owns these two recipes now. Edit the
 * values in `Theme.tsx` to restyle every control that uses them.
 */

/** Text inputs and textareas. */
export let field = css({
    minHeight: theme.control.height.sm,
    width: "100%",
    paddingInline: theme.space.sm,
    border: `0.5px solid ${theme.colors.border.default}`,
    borderRadius: theme.radius.md,
    backgroundColor: theme.surface.lvl0,
    color: theme.colors.text.primary,
    fontFamily: theme.fontFamily.sans,
    fontSize: theme.fontSize.sm,
    lineHeight: theme.lineHeight.normal,
    boxShadow: "inset 0 1px 0 light-dark(rgb(255 255 255 / 0.7), rgb(255 255 255 / 0.04))",
    "&:focus-visible": {
        outline: `2px solid ${theme.colors.focus.ring}`,
        outlineOffset: theme.space.none,
    },
});

/** Buttons, and anything that should read as one. */
export let button = css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: theme.control.height.md,
    paddingInline: theme.space.xl,
    border: `1px solid ${theme.colors.action.primary.border}`,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.action.primary.background,
    color: theme.colors.action.primary.foreground,
    fontFamily: theme.fontFamily.sans,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    lineHeight: theme.lineHeight.normal,
    cursor: "pointer",
    boxShadow: theme.shadow.xs,
    "&:hover:not(:disabled)": {
        backgroundColor: theme.colors.action.primary.backgroundHover,
    },
    "&:active:not(:disabled)": {
        backgroundColor: theme.colors.action.primary.backgroundActive,
    },
    "&:focus-visible": {
        outline: `2px solid ${theme.colors.focus.ring}`,
        outlineOffset: theme.space.xs,
    },
    "&:disabled": {
        cursor: "not-allowed",
        opacity: 0.55,
    },
});
