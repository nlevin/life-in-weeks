# The role map

The role map names each of the app's tokens and the Graphical token closest to its meaning. The import script builds it, usually from a [profile](profiles.md), and writes it into `graphical/install/import.json`. Install converts it and writes `graphical/role-map.json`, where each converted app token aliases one Graphical token; the finish step rewrites the definitions to match, and the installed editor reads that map.

Each entry in `tokens` names one of the app's CSS custom properties. Apps styled through a JavaScript theme use `objectRoles`, which name paths in that theme instead. They take the same tokens, formats and `derive`; see [theme objects](theme-objects.md).

```json
{
  "version": 1,
  "profile": "css-variables",
  "modes": { "kind": "class", "dark": "dark" },
  "tokens": [
    { "variable": "--surface", "token": "neutral-1", "defined": { "path": "app/globals.css", "selector": ":root" } },
    { "variable": "--text", "token": "neutral-10" },
    { "variable": "--border", "token": { "light": "neutral-4", "dark": "neutral-10-transparent" } }
  ],
  "appearance": {},
  "fixed": ["--chart-electric", "--map-water"]
}
```

Set `root` to a selector when the tokens live on a wrapper. See [appearance](appearance.md) for `appearance`.

## Graphical tokens

Discover the app's [starting palette](starting-palette.md) before filling the color slots: up to ten accents selected from actual usage, with separate neutrals and statuses. A package's default colors are not evidence about the receiving app.

| Token | Meaning |
| --- | --- |
| `neutral-1` … `neutral-10` | Neutral ramp: page surface to strongest text |
| `color-1` … `color-10` | Palette; `color-1` is the key brand color |
| `success`, `warning`, `error` | Status colors |
| `<color>-translucent` | That color at its translucent opacity (40% unless edited) |
| `<color>-transparent` | That color at its transparent opacity (20% unless edited) |
| `primary`, `primary.foreground` | Primary action fill and its readable text |
| `on:<color>` | Readable text on that color |
| `space.zero`, `space.xxs` … `space.xxl` | Spacing steps |
| `radius.zero`, `radius.xs` … `radius.xl`, `radius.full` | Corner steps |
| `border.none`, `border.s`, `border.m`, `border.l` | Stroke widths |
| `shadow.s`, `shadow.m`, `shadow.l` | Elevation |
| `text.<step>.size`, `.lineHeight`, `.tracking` | Body type scale: body and data text |
| `display.<step>.size`, `.lineHeight`, `.tracking` | Display type scale: display text |
| `tracking.xs` … `tracking.xl` | Letter-spacing scale |
| `font.body`, `font.display`, `font.data` | Font roles |
| `weight.<role>.regular`, `.medium`, `.heavy` | Each role's weights |
| `motion.small.duration`, `.easing` (also `large`) | Motion |
| `focus.color`, `focus.width` | Focus ring |

Steps run `xxs`, `xs`, `s`, `m`, `l`, `xl`, `xxl`. A token can differ by mode: `{ "light": "neutral-4", "dark": "neutral-10-transparent" }`.

## Typography

- **Font roles.** Body sets all interface and reading text; map the face the UI and body copy inherit to `font.body`, even when it's a serif. Display sets headings and hero text; map a distinct heading face to `font.display`, or the body face when the app has only one. Data sets numbers, code and tables; map a monospaced or tabular face to `font.data`. It isn't always monospaced.
- **Type scales.** The font role picks the scale: display text uses `display.*`, body and data text use `text.*`. Map a heading or hero size token to the display scale and every other size to the body scale. Conversion fits a display scale to the app's headings, so map only the display tokens the app defines; a document without its own display scale uses the body scale's values.
- **Sizes and line heights together.** A size takes its own line height. Map each size token with the line height it pairs with; a standalone leading token maps to the line height of the size it's used with.
- **Weights.** Map the app's weights to the role whose face they set. Weight is separate from the text style: a style sets size, line height and tracking, and the element keeps its own weight.
- **Older names.** Older role maps still load: `ui` becomes `body`, `brand` and `editorial` become `display`, and `weight.ui.*` becomes `weight.body.*`. Write new maps with the new names.

## Formats

`format` describes what the app's variable holds. It defaults to plain CSS.

| Format | Example value |
| --- | --- |
| `css` | `oklch(0.6 0.2 260)`, `#4262ff`, `12px`, `0 2px 8px …` |
| `hex`, `oklch` | A color forced to that notation |
| `rgb-channels`, `hsl-channels`, `oklch-channels` | `66 98 255`, `222 47% 11%`, `0.62 0.19 264` |
| `px`, `rem`, `em` | Lengths; `rootFontSize` defaults to 16 |
| `number` | Unitless numbers: weights, or pixel counts used as `calc(var(--x) * 1px)` |
| `ratio` | A unitless line height for a `lineHeight` token |
| `ms`, `s` | Durations |

Bare channel variables can't hold translucency. Add `alphaVariable` when the app keeps opacity separately; otherwise map them to opaque tokens.

## Derived tokens

`derive` records that an app token is computed from another one:

- `{ "scale": 1.25 }` for a step between Graphical's steps, such as `--text-xl` as 1.25 × `text.m.size`.
- `{ "alpha": 0.15 }` or `{ "alpha": { "light": 1, "dark": 0.15 } }` for translucent edges.
- `{ "mix": 0.7, "with": "neutral-1" }` for tints and shades. `with` also accepts a literal color such as `#000`.

Use `derive` whenever the app's token is computed from another one, so the import records the family. Conversion then moves each derived token onto a single Graphical token: a tint onto a translucent level, a scaled step onto a step or a multiple of XXL.

## Modes

`modes` tells Graphical how the app switches light and dark. The generated `theme.css` and the installed editor follow it.

- `{ "kind": "class", "dark": "dark" }` toggles a class on `html`, or on `target`.
- `{ "kind": "attribute", "attribute": "data-theme", "dark": "dark", "light": "light", "target": "…" }` sets an attribute.
- `{ "kind": "media" }` follows the system until the user switches the editor's local preview. The preview temporarily forces readable CSS color-scheme queries, mapped tokens and native control appearance, then restores host media when removed. JavaScript-owned themes still connect the app's `colorMode`/`onColorModeChange` bridge; the editor never changes the OS or spoofs `matchMedia`.
- `{ "kind": "bridge" }` is for apps that decide their mode in JavaScript. Pass that mode to the editor; see [installed editor](../../graphical-adopt/references/installed-editor.md).
- `{ "kind": "fixed", "mode": "dark" }` (or `"light"`) names the one authoritative theme slot for a single-mode app. The editor starts in that slot and allows temporary light/dark preview from its footer; the generator still writes the fixed source slot at `:root`. Previewing another mode does not change this mapping.
- Legacy `{ "kind": "none" }` or omitted `modes` uses the light slot. When a single-mode app is dark, migrate it to explicit fixed dark and ensure its dark theme values are the authored baseline. Do not fake a provider mode with local state or mirror edits into both slots to compensate.

## Where tokens are defined

`defined` records where the app sets a value (`path`, plus `selector` or `symbol`). The finish step rewrites the definition there as an alias, so add it for every role you can locate.

Two roles that name one Graphical token should hold the same value. When they don't, give one its own token or `derive` it from the other.
