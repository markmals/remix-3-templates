/**
 * App-owned design tokens, published to the document as CSS custom properties.
 *
 * Edit the values in `TOKENS`, then reference them in `css()` mixins through the
 * exported `theme` object, e.g. `css({ gap: theme.space.md })`.
 */

const PREFIX = "--rmx";

const TOKENS = {
    fontFamily: {
        sans: '"Inter var", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    space: {
        none: "0px",
        px: "1px",
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        xxl: "24px",
    },
    radius: {
        none: "0px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
    },
    fontSize: {
        xxxs: "10px",
        xxs: "11px",
        xs: "12px",
        sm: "14px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        xxl: "28px",
    },
    lineHeight: { tight: "1.2", normal: "1.5", relaxed: "1.7" },
    letterSpacing: {
        tight: "-0.025em",
        normal: "0",
        meta: "0.025em",
        wide: "0.05em",
    },
    fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
    control: { height: { sm: "28px", md: "36px", lg: "44px" } },
    shadow: {
        xs: "0 1px 2px rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px rgb(0 0 0 / 0.10)",
        md: "0 4px 10px rgb(0 0 0 / 0.12)",
        lg: "0 10px 30px rgb(0 0 0 / 0.16)",
        xl: "0 20px 50px rgb(0 0 0 / 0.20)",
    },
    surface: {
        lvl0: "light-dark(#ffffff, #0a0a0a)",
        lvl1: "light-dark(#f9fafb, #111827)",
        lvl2: "light-dark(#f3f4f6, #1f2937)",
        lvl3: "light-dark(#e5e7eb, #374151)",
        lvl4: "light-dark(#d1d5db, #4b5563)",
    },
    colors: {
        text: {
            primary: "light-dark(#111827, #f3f4f6)",
            secondary: "light-dark(#374151, #d1d5db)",
            muted: "light-dark(#6b7280, #9ca3af)",
            link: "light-dark(#2563eb, #60a5fa)",
        },
        border: {
            subtle: "light-dark(#e5e7eb, #1f2937)",
            default: "light-dark(#d1d5db, #374151)",
            strong: "light-dark(#9ca3af, #4b5563)",
        },
        focus: { ring: "light-dark(#3b82f6, #60a5fa)" },
        overlay: { scrim: "rgb(0 0 0 / 0.45)" },
        action: {
            primary: {
                background: "light-dark(#2563eb, #3b82f6)",
                backgroundHover: "light-dark(#1d4ed8, #2563eb)",
                backgroundActive: "light-dark(#1e40af, #1d4ed8)",
                foreground: "#ffffff",
                border: "light-dark(#2563eb, #3b82f6)",
            },
            secondary: {
                background: "light-dark(#ffffff, #18181b)",
                backgroundHover: "light-dark(#f9fafb, #27272a)",
                backgroundActive: "light-dark(#f3f4f6, #3f3f46)",
                foreground: "light-dark(#111827, #f3f4f6)",
                border: "light-dark(#d1d5db, #374151)",
            },
            danger: {
                background: "light-dark(#dc2626, #ef4444)",
                backgroundHover: "light-dark(#b91c1c, #dc2626)",
                backgroundActive: "light-dark(#991b1b, #b91c1c)",
                foreground: "#ffffff",
                border: "light-dark(#dc2626, #ef4444)",
            },
        },
    },
};

type TokenGroup = { [key: string]: string | TokenGroup };

type TokenVars<group extends TokenGroup> = {
    readonly [key in keyof group]: group[key] extends TokenGroup ? TokenVars<group[key]> : string;
};

const UPPER_CASE = /[A-Z]/g;

function toKebabCase(key: string) {
    return key.replace(UPPER_CASE, char => `-${char.toLowerCase()}`);
}

/** Maps a token group to `var()` references, e.g. `theme.space.md` → `"var(--rmx-space-md)"`. */
function toVars<group extends TokenGroup>(group: group, prefix: string): TokenVars<group> {
    let vars = Object.fromEntries(
        Object.entries(group).map(([key, value]) => {
            let name = `${prefix}-${toKebabCase(key)}`;
            return [key, typeof value === "string" ? `var(${name})` : toVars(value, name)];
        }),
    );

    // `Object.entries` erases the tree's key structure, so restore it here
    return vars as TokenVars<group>;
}

/** Serializes a token group to CSS custom property declarations. */
function toDeclarations(group: TokenGroup, prefix: string): string[] {
    return Object.entries(group).flatMap(([key, value]) => {
        let name = `${prefix}-${toKebabCase(key)}`;
        return typeof value === "string" ? `${name}: ${value};` : toDeclarations(value, name);
    });
}

/** Design token `var()` references for use in `css()` mixins. */
export let theme = toVars(TOKENS, PREFIX);

const CSS_TEXT = [
    // Layer order: the preflight reset must lose to the `css()` mixin styles in `rmx`
    "@layer rmx-reset, rmx;",
    `:root {\n${toDeclarations(TOKENS, PREFIX)
        .map(declaration => `    ${declaration}`)
        .join("\n")}\n}`,
    `@layer rmx-reset {
    body {
        font-family: ${theme.fontFamily.sans};
        font-size: ${theme.fontSize.md};
        line-height: ${theme.lineHeight.normal};
        color: ${theme.colors.text.primary};
        background-color: ${theme.surface.lvl0};
    }
}`,
].join("\n\n");

/** Defines the design tokens and base document styles; render once inside `<head>`. */
export function Theme() {
    return () => <style innerHTML={CSS_TEXT} />;
}
