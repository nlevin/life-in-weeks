# Graphical install

Rewrote 3 source files and wrote the project files in `graphical`.

## Use sites

| Family | Rewritten | Removed | Skipped | Tokens | Kept | Preserved |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| border-width | 25 | 0 | 0 | 0 | 0 | 1 |
| color | 1 | 0 | 0 | 95 | 17 | 7 |
| font-family | 9 | 0 | 0 | 0 | 0 | 1 |
| font-size | 44 | 0 | 0 | 0 | 0 | 0 |
| font-weight | 23 | 0 | 0 | 0 | 0 | 0 |
| letter-spacing | 43 | 0 | 0 | 0 | 1 | 0 |
| line-height | 41 | 0 | 0 | 0 | 0 | 7 |
| radius | 33 | 0 | 0 | 0 | 0 | 3 |
| shadow | 0 | 0 | 0 | 0 | 2 | 3 |
| spacing | 115 | 0 | 0 | 0 | 0 | 2 |
| token | 20 | 0 | 0 | 0 | 0 | 0 |

Removed: line heights and tracking a text style carries instead. Tokens: uses of the app’s own tokens, such as `bg-background`, which follow the token once it aliases a Graphical one, and classes that already have Graphical’s name, such as `font-medium`. Kept: values the conversion keeps as authored. Preserved: values the analysis preserved, such as content colors, artwork, state recipes and dynamic values.

## Units

| Family | Values | Units | Multiples | Kept |
| --- | ---: | ---: | ---: | ---: |
| Colors | 11 | 9 | 0 | 0 |
| Text sizes | 13 | 6 | 0 | 0 |
| Font weights | 3 | 3 | 0 | 0 |
| Letter spacing | 1 | 0 | 0 | 1 |
| Spacing | 16 | 7 | 2 | 0 |
| Corners | 9 | 5 | 0 | 0 |
| Borders | 4 | 3 | 0 | 0 |
| Shadows | 2 | 0 | 0 | 2 |

## Skipped sites

None.

## Text style overrides

0 already present in source; 4 retained during this conversion.

These stay beside their text style, so the inspector shows each as an override of it.

- `src/styles.css:82` `letter-spacing:.06em;` on Body XS: a value kept as authored
- `src/styles.css:85` `line-height:1;` on Display XXS: leading that sets a box’s height
- `src/styles.css:113` `line-height:1` on Body L: leading that sets a box’s height
- `src/styles.css:124` `line-height:1;` on Body L: leading that sets a box’s height

## Spacing multiples

Spacing past the largest step is written as a multiple of it. Name the large ones in a few places for what they are, such as `--page-gutter` or `--toolbar-clearance`: a custom property in a CSS rule beside the layout, with its responsive values, that the layout reads through `var(--page-gutter)`. A multiple used widely is ordinary spacing the scale doesn’t reach: raise it rather than naming it. Steps such as `gap-m` and `px-l` stay as classes.

| Multiple | Value | Uses | Files | Most used as |
| --- | ---: | ---: | ---: | --- |
| XXL × 1.75 | 40.25px | 1 | 1 | `margin: calc(var(--space-xxl) * 1.75)` (1) |
| XXL × 1.25 | 28.75px | 1 | 1 | `margin: calc(var(--space-xxl) * 1.25)` (1) |

## Kept values

- `0.06em` (letter-spacing): range
- `0-6px 20px rgba(0,0,0,.08)` (shadow): unreadable
- `inset 0 0 0 1px rgba(0,0,0,.08)` (shadow): inset
- `rgba(246,242,234,.55)` (color, `--veil`): unsafe

## Warnings

- Install found no Prettier, so the files it rewrote keep its own formatting. Run the project’s formatter on them.

## Left to the agent

- Load `graphical/generated/theme.css` before the app’s styles. Install rewrote the token definitions written in CSS as aliases. Semantic names such as `bg-background` stay as aliases.
- Resolve the skipped sites, install the theme’s fonts and mount the editor.
- Check the running app. This report and `graphical-install --check` read source, so they show the conversion is complete, not that the app runs. Load the home page and one other page with the dev server: each renders with the editor mounted, and the browser console and the framework’s error overlay show no errors. A page can answer HTTP 200 while a client error stops the editor from loading.
