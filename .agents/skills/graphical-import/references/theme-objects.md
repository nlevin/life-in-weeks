# Theme objects: apps styled through JavaScript

Use this when components read the theme from a JavaScript object rather than from CSS variables. For example: styled-components or Emotion (`${({ theme }) => theme.colors.primary}`), MUI (`createTheme`, `sx`), theme-ui or styled-system, or a custom React context. When the app also has CSS variables, map those in `tokens` as usual; both work together.

## Role map

Theme values go in `objectRoles`. Each `path` is a dot path from the object the app passes to its provider. Array steps use their index (`space.2`).

```json
{
  "version": 1,
  "profile": "theme-object",
  "modes": { "kind": "bridge" },
  "tokens": [],
  "objectRoles": [
    { "path": "colors.background", "token": "neutral-1", "defined": { "path": "src/theme.ts", "symbol": "lightTheme" } },
    { "path": "colors.surface", "token": { "light": "neutral-1", "dark": "neutral-2" } },
    { "path": "colors.text", "token": "neutral-10" },
    { "path": "colors.brand", "token": "color-1" },
    { "path": "colors.brandHover", "token": "color-1", "derive": { "mix": 0.15, "with": "#000" } },
    { "path": "radii.card", "token": "radius.l", "format": "number" },
    { "path": "fonts.body", "token": "font.body" },
    { "path": "fonts.heading", "token": "font.display" },
    { "path": "space.1", "token": "space.xxs", "format": "number" },
    { "path": "space.2", "token": "space.xs", "format": "number" }
  ],
  "appearance": { "navigation": { "selector": "nav[aria-label=\"Main\"]" } }
}
```

- `format` describes the stored value. Use `css` (the default) for color strings, font stacks and lengths with units such as `'12px'`. Use `number` for plain numbers (`borderRadius: 8`, `space: [0, 4, 8]`, weights) and `ratio` for unitless line heights. `px` and `rem` write strings with that unit. Numbers stay numbers.
- With separate objects per mode, one role covers both modes, and `token` can differ by mode. When one object holds both modes, give each path its `mode`.
- `defined` points at the file and exported object (`symbol`) that holds the value. The finish step writes there.
- Derived values (`derive`) suit theme entries that are tints or shades of another entry.

Start from the stack's standard paths:

| Stack | Paths |
| --- | --- |
| MUI | `palette.primary.main` → `primary`, `palette.secondary.main` → `color-2`, `palette.error.main`, `.warning.main`, `.success.main` → statuses, `palette.background.default` → `neutral-1`, `palette.background.paper` → `{ "light": "neutral-1", "dark": "neutral-2" }`, `palette.text.primary` → `neutral-10`, `palette.text.secondary` → `neutral-8`, `palette.divider` → `neutral-10-transparent`, `shape.borderRadius` → `radius.m`, `spacing` → `space.xs`, `typography.fontFamily` → `font.body`, `typography.fontSize` → `text.s.size` (MUI scales its type ramp from this 14px size), `typography.fontWeightRegular`, `Medium`, `Bold` → `weight.body.regular`, `.medium`, `.heavy`. Numbers use `format: "number"`. Navigation is `.MuiDrawer-paper` and cards are `.MuiCard-root`. |
| theme-ui, styled-system, Rebass | `colors.text` → `neutral-10`, `colors.background` → `neutral-1`, `colors.primary` → `primary`, `colors.secondary` → `color-2`, `colors.muted` → `neutral-3`, `fonts.body` → `font.body`, `fonts.heading` → `font.display`, `fonts.monospace` → `font.data`, `fontWeights.body` → `weight.body.regular`, `fontWeights.heading` → `weight.display.heavy`, `fontWeights.bold` → `weight.body.heavy`, `lineHeights.body` → `text.m.lineHeight` (`ratio`). When one object holds both modes, map `colors.modes.dark.*` with `"mode": "dark"`. |
| Anything else | Roles you write from the object's own keys |

With MUI's `colorSchemes`, one options object holds both modes: prefix the palette paths with `colorSchemes.light.` and `colorSchemes.dark.`, each with its `mode`, and set `modes` to match MUI's `colorSchemeSelector`. Map the options the app passes to `createTheme`, not the created theme.

`{ "kind": "bridge" }` marks a mode decided in JavaScript. When the app also toggles a class for its CSS (next-themes, for example), use that class strategy instead.

## After install

The install script rewrites style objects at use sites but not the theme object itself. Finish each converted path where it's defined:

- **Where the stack accepts CSS strings,** as styled-components, Emotion and theme-ui do for colors and lengths, make the value a Graphical variable: `colors.background: 'var(--neutral-1)'`, `radii.card: 'var(--radius-l)'`.
- **Where code needs the value itself,** keep its type and write the converted value. A number used in arithmetic or with a unit appended can't hold a variable. MUI derives hover shades, contrast text and channels from palette colors inside `createTheme`, so its palette holds converted colors, not variables.
- **Values written as copies** follow the active theme only when a later theme change rewrites them. graphical-adopt's [writing theme changes](../../graphical-adopt/references/writing-tokens.md#theme-objects) covers that.

The installed editor applies live edits to theme objects through `onThemeObjectChange` and `applyHostThemeObject`; see [installed editor](../../graphical-adopt/references/installed-editor.md).

## Limits

- Components that import theme values directly (`import { colors } from './theme'`) rather than reading them through the provider get the converted values from the same file, but the editor's live edits don't reach them until source changes.
- CSS-in-JS class names are generated, so pick stable region selectors for Appearance: MUI's `Mui*` class names, semantic elements (`nav`, `aside`, `[role="navigation"]`) or `data-*` attributes. Contrast navigation needs CSS variables to apply the dark palette within a region, so apps styled only through a theme object offer Blended and Subtle.
