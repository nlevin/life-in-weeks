# Make the app's tokens aliases of Graphical's

Graphical's tokens become the definitions, and each converted app token aliases one of them. The install script does this where it can: every token definition written in CSS becomes its alias in place, in a global `:root` and dark block, `@theme`, or each CSS module's own copy. For tokens the app defines in JavaScript, such as a Tailwind plugin that adds `:root` variables or a theme package that writes them at runtime, it writes `graphical/generated/aliases.css` instead: each of those tokens as an alias, light at `:root` and dark where the app switches modes. Tokens a CSS rule defines aren't in it; install aliased them where they are. `graphical/role-map.json` lists every converted app token, the Graphical token it aliases and where it's defined (`defined`). Tokens in its `fixed` list stay as authored.

## Use aliases.css

Import it once, right after `theme.css`, and remove the JavaScript definitions it replaces. Remove a definition rather than leaving both: whichever loads last wins, and a channel definition left behind would break the reads install rewrote. When the app defines tokens under a more specific selector than `:root` and the mode selector, keep that selector and copy the aliases into it. The install report's `token` changes list the definitions it already rewrote in CSS.

## Import theme.css once

`graphical/generated/theme.css` defines Graphical's variables for the active theme, light and dark, in a stable order: colors, fonts, body text, display text, spacing, corners and edges, shadows, motion. Import it once, where the app loads its global styles and before the app's own token definitions: next to the global stylesheet's import in the root layout, or as the global stylesheet's first `@import`. Production loads it too; it's plain CSS. Check that its dark values switch the way the app switches modes, as the role map's `modes` describes.

## CSS variables

When you write aliases by hand, as for a token `aliases.css` can't name, replace each converted token's value with its Graphical variable, in every block that defines it:

```css
:root {
  --background: var(--neutral-1);
  --foreground: var(--neutral-10);
  --radius: var(--radius-m);
  --gutter: calc(var(--space-xxl) * 1.5);
}
```

- **One alias per token.** Graphical's variables already switch with the mode, so a token that aliases the same Graphical token in both modes needs no dark redefinition: remove it from the dark block. A token whose Graphical token differs by mode, such as `{ "light": "neutral-4", "dark": "neutral-10-transparent" }`, aliases each in its own block.
- **Plain aliases.** No multipliers, derived ratios or `color-mix()` around the alias. Spacing beyond XXL keeps the multiple conversion chose. Where the app computed a token from another, replace the expression with the alias the role map gives.
- **Names.** Keep semantic names, such as color roles or a named radius, as aliases. A token whose name encodes a number (`--spacing-4`, `--text-14`) can't alias truthfully; its use sites are already rewritten, so remove it once nothing reads it.
- **Short paths.** A component reads a Graphical token, or an app alias of one, which reads the theme's value. Keep an alias when it names something in the app, such as a surface or a page gutter; don't add one per declaration or chain aliases.
- **Every declaration.** Scoped or repeated declarations (CSS Modules, product wrappers, `@theme`) all alias. Repeats of the same palette can collapse into one shared definition.
- **Shared names.** An app token named like a Graphical variable, such as `--error` or `--font-body`, can't alias itself. When it maps to that same Graphical token, remove the app's definition: `theme.css` defines it now. When it means something else, rewrite its uses to the Graphical token conversion chose, then remove it. Never define one variable in both places.

Graphical's variable names:

| Family | Variables |
| --- | --- |
| Colors | `--color-1`…`--color-10`, `--neutral-1`…`--neutral-10`, `--success`, `--warning`, `--error`, each with `-translucent` and `-transparent` |
| Text on a color | `--on-{color}`, such as `--on-color-1`: the readable foreground `on:` tokens alias |
| Body type | `--size-{step}`, `--line-{step}`, `--letter-spacing-{step}` |
| Display type | `--display-size-{step}`, `--display-line-{step}`, `--display-letter-spacing-{step}` |
| Fonts | `--font-body`, `--font-display`, `--font-data` |
| Weights | `--weight-{role}-{weight}`; `--weight-regular`, `--weight-medium` and `--weight-heavy` follow the current role |
| Tracking | `--tracking-{xs…xl}` |
| Spacing | `--space-{zero, xxs…xxl}` |
| Corners | `--radius-{zero, xs…xl, full}` |
| Strokes | `--border-{none, s, m, l}` |
| Shadows | `--shadow-{s, m, l}` |

Steps run `xxs`, `xs`, `s`, `m`, `l`, `xl`, `xxl`.

## Semantic colors

The app's semantic color names stay, as aliases of Graphical colors: `bg-background` keeps working and paints Neutral 1.

- **Channel variables.** When the app stores bare channels and its consumers wrap them (`hsl(var(--background))`, `rgb(var(--accent) / 0.5)`), mark the tokens with a channel `format` in the role map. Install makes them full colors: `aliases.css` aliases them and install rewrites each read it finds to the color or a `color-mix()` at its opacity. Reads it can't rewrite, such as a theme helper that builds `rgb(var(${name}) / <alpha-value>)`, are in the report's warnings; replace them by hand. For a Tailwind config, see [compiled scales](compiled-scales.md#semantic-colors).
- **Opacity.** A color the app paired with a separate alpha variable becomes the Graphical level conversion chose: the color, or its translucent or transparent level.

## JavaScript themes

A theme object holds values, not declarations. See [theme objects](theme-objects.md#after-install).

## Check

Every converted token resolves to its Graphical variable in both modes. Search the app's global stylesheets, theme files and configuration for the converted tokens: none is still defined with an authored value.
