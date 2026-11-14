# Compiled scales and Tailwind

Read this when utilities or shared theme declarations compile scale values into CSS, especially Tailwind v3. Before install, the analysis needs the app's resolved scales to read its classes. After install, the converted scales come from Graphical.

## Before the analysis: read the resolved configuration

For Tailwind 3, pass the config file to `analyzeAppStyles` as `tailwindConfig`, relative to the root. The analyzer loads it with the app's own Tailwind, as its build does, so presets, plugins, defaults and extensions are all read. It flattens nested colors, fills Tailwind's `<alpha-value>` placeholder at full opacity and collects the `:root` variables plugins add. Pass `scales` or `variables` only to add what it can't see, such as variables a theme package writes at runtime.

For Tailwind 4, pass `tailwind: true`. The analyzer reads Tailwind's own theme and the app's `@theme` blocks in the analyzed CSS, including a custom `--spacing` unit.

A color class with an opacity modifier, such as `bg-white/20`, converts its base color and keeps the modifier.

Trace each family to its consumers:

| Family | Consumers | Converted |
| --- | --- | --- |
| Spacing | `p-*`, `m-*`, `gap-*`, `space-*` | Yes |
| Typography | `text-*`, inherited body size, `leading-*`, tracking, prose plugin styles | Yes |
| Fonts and weights | Preflight and body font, `font-sans`, heading faces, `font-normal`, `font-medium`, `font-semibold` and custom weights | Yes |
| Corners | `rounded`, `rounded-*` | Yes, to `corner-*` |
| Strokes | Border widths, dividers, rings used as edges, zero-blur shadow edges | Yes, to `edge-*` |
| Elevation | `shadow-*` | Yes |
| Colors | `bg-*`, `text-*`, `border-*` and the other color utilities | Yes |
| Geometry | `w-*`, `h-*`, `size-*`, insets, transforms, breakpoints, aspect ratios | No: Tailwind's own scale |

Motion isn't converted: its tokens and classes stay as authored. Arbitrary utilities such as `rounded-[15px]` are use sites like any other and convert with their family.

The role map needs only the variables the app defines, usually its semantic colors. Tailwind v3's scales are values at use sites, not tokens: the analysis reads them and the install script rewrites the classes.

## After install

### Tailwind v3

Install writes `graphical/generated/tailwind-preset.cjs`: Graphical's classes, each reading its variable from `graphical/generated/theme.css`.

1. Add the preset to the config's `presets`.
2. Replace, rather than extend, the converted scales. The preset sets padding, margin, gap, space, `fontSize`, `fontFamily`, `fontWeight`, `letterSpacing` and `boxShadow` in `theme`. Remove the app's own entries for those keys from its `theme`, where they would replace the preset's, and from `theme.extend`, where they would add stale steps. Corners and strokes are the preset's own `corner-*` and `edge-*` utilities, so the app's `borderRadius` and `borderWidth` stay for the `rounded-*` and `border-*` classes install kept or preserved.
3. Keep `spacing` itself: Tailwind builds `w-*`, `h-*`, `size-*`, insets and transforms from it, and geometry keeps Tailwind's own scale. The preset extends colors rather than replacing them, so the app's semantic colors and Tailwind's palette stay available. Keep plugins, content globs, breakpoints, motion and everything outside the converted families.
4. Keep the keys the report's `scales` lists, under `extend`, or rewrite their classes. Kept, preserved and skipped classes such as `p-4` render only while the app's config defines their keys. Tailwind fails the build on an `@apply` that names a missing key; the report's warnings list them.
5. When the app's colors are channel entries, such as `rgb(var(--color-label) / <alpha-value>)`, replace them with `graphical/generated/tailwind-colors.cjs`: the same names, reading the full colors the tokens now hold. See [semantic colors](#semantic-colors).
6. Run the project's formatter over the rewritten files, so a class-sorting plugin such as `prettier-plugin-tailwindcss` sorts Graphical's classes with the preset in place.

Classes after install:

| Family | Classes | Value |
| --- | --- | --- |
| Spacing | `p-`, `m-`, `gap-`, `space-` with `zero`, `xxs`…`xxl` | `var(--space-…)` |
| Larger spacing | `p-[calc(var(--space-xxl)*4/3)]` | Multiples of XXL, in quarters and thirds, so 4px, 6px and 8px grids stay exact |
| Text | `text-body-{step}`, `text-display-{step}` | Size, line height and tracking |
| Fonts | `font-body`, `font-display`, `font-data` | The role's family and weights |
| Weights | `font-regular`, `font-medium`, `font-heavy` | The current role's weight |
| Tracking | `tracking-{xs…xl}` | `var(--tracking-…)` |
| Corners | `corner-{zero, xs…xl, full}`; sides `corner-t-m`, `corner-tl-s`, and logical `corner-s-m` and `corner-ss-m` | `var(--radius-…)` |
| Strokes | `edge-{none, s, m, l}`; sides `edge-t-m`, `edge-x-s`, and logical `edge-s-m` | The width, `var(--border-…)` |
| Shadows | `shadow-{s, m, l}`, `shadow-none` | `var(--shadow-…)` |
| Colors | `bg-`, `text-`, `border-` with Graphical color names | `var(--…)`, opacity modifiers included |

Classes keep Tailwind's prefixes and take Graphical's step names, except corners and strokes: `corner-*` and `edge-*` leave Tailwind's `rounded-*` and `border-*` their own meaning, so a directional class such as `rounded-s` (the start corners) or `border-l` (the left edge) never reads as an S or L step. Text that sets a text style has no `leading-*` class, and no `tracking-*` class within a step of the style's: the style carries both. `font-medium` means medium in whatever face the text uses, because the display and data font classes point the current weights at their own role. Bare `rounded` becomes the corner step nearest Tailwind's 4px default, and bare `border` becomes `edge-m`.

An edge sets the stroke's width and keeps its style; its color stays a `border-*` class. Stroke, elevation and focus are separate properties, so `edge-m border-neutral-4 shadow-s focus-visible:ring-2` composes all three, and none replaces another.

### Semantic colors

The app's semantic color names, such as `bg-background`, stay as aliases of Graphical colors: the CSS variable aliases its Graphical color (see [aliases](aliases.md)), and the config entry reads that variable in the same form the preset uses for its own colors, so opacity modifiers such as `bg-background/50` keep working:

```js
// tailwind.config.js, inside theme.extend.colors
background: 'color-mix(in srgb, var(--background) calc(<alpha-value> * 100%), transparent)',
```

`graphical/generated/tailwind-colors.cjs` holds these entries for every color token, when the app's colors were channels. Don't leave a channel wrapper such as `hsl(var(--background))` around a variable that now holds a full color.

When the app uses tailwind-merge, pass `graphical/generated/tailwind-merge.cjs` to its `extendTailwindMerge`, and make every `cn()` use that merger. It names Graphical's text styles, weights, tracking and shadows, and groups `corner-*` and `edge-*` by side, each overriding Tailwind's `rounded-*` or `border-*` for the same corners and the reverse, so `cn('corner-m', className)` gives way to a caller's `rounded-none`. A `cn` imported from a library merges with Tailwind's defaults and drops `text-body-m` beside `text-label`; give the app its own `cn` and point the imports at it.

### Tailwind v4

Install writes `graphical/generated/tailwind-theme.css`, Graphical's classes for v4. Import it right after `@import "tailwindcss"`. It reads each class's value from `theme.css` without redefining Graphical's variables, and it names spacing through the padding, margin, gap and space namespaces, so `max-w-xl` and other sizes keep Tailwind's container scale. Corners, strokes and font roles are its own utilities, so Tailwind's `rounded-*` and `border-*` keep their meaning. Alias the app's own converted `@theme` variables as described in [aliases](aliases.md). Leave `--spacing` as authored: v4 builds sizes from it.

### Other compiled systems

Sass or Less variables and other build-time tokens alias Graphical's CSS variables where the output is CSS. Where a value must be known at build time, such as in a media query or a calculation the compiler evaluates, keep it as authored and say so.

## Check the compiled output

When a compiled class's value is uncertain, use the installed compiler to emit a few affected classes and confirm they read Graphical's variables. Keep temporary inputs and outputs outside the repository. Don't generate a test suite or matrix for every utility.
