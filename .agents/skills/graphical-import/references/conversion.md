# Convert the app onto Graphical

Import converts the app's styles onto Graphical's system instead of connecting Graphical to every value the app happens to use. Graphical's units are fitted to the app's own dominant values, every value maps onto them, and anything that can't move without a visible change stays as authored and is counted. The [install script](install-script.md) runs the conversion; this reference covers its inputs and what it does.

## 1. Analyze the whole app

Analyze every frontend route and shared UI package with `analyzeAppStyles` from `@graphical/editor/analyze-styles`, not just the home page. It runs in a Node script using Graphical's own pinned TypeScript compiler dependency, which installs automatically with the editor. Preserve the app's TypeScript version, including TypeScript 7; no compiler alias or loader shim is needed. Graphical also owns its CSS parser. No app-level TypeScript or parser installation is needed for JavaScript apps. Never upgrade the app's framework or utility framework for the analyzer.

```js
// graphical/install/analyze-styles.mjs
import { analyzeAppStyles } from '@graphical/editor/analyze-styles';
import { writeFile } from 'node:fs/promises';

const inventory = await analyzeAppStyles({
  root: process.cwd(),
  roots: ['src'], // Every frontend root and shared UI package.
  appName: 'Your app',
  tailwindConfig: 'tailwind.config.ts', // Tailwind 3; for Tailwind 4, `tailwind: true`.
  variables: {}, // Custom properties written at runtime, which the source can't show.
  classify({ family, path, text, property, value }) {
    // { preserve: true } for data, artwork, functional geometry and routes
    // outside the product. An optional role and mode label semantic paints.
    return {};
  },
});
await writeFile(
  new URL('./style-inventory.json', import.meta.url),
  JSON.stringify(inventory),
);
```

Run it from the app root with `node graphical/install/analyze-styles.mjs`. The import's scripts and what they write live in `graphical/install/`, apart from the files the app runs on. Keep the script: verification and later updates re-run it against current source. The analyzer loads a Tailwind 3 config with the app's own Tailwind and reads Tailwind 4 themes from the app's CSS; see [compiled scales](compiled-scales.md). Don't execute other app initialization. Leave the `graphical/` folder out of `roots`. Mark as preserved:

- colors that come from content rather than the design: free-form colors people enter, map and chart data paint, avatar gradients;
- text and fills over photos and video, such as captions and glass chips. A literal white there stays white in dark mode, but conversion would hand it Neutral 1, which turns dark;
- artwork, logos and icon files;
- functional geometry such as widths, heights, insets and transforms;
- the marketing website, when it lives in the same repository. Conversion is for the app first.

Class conversion follows actual `class`/`className` consumers, class helpers, referenced constants and variant maps. Ordinary app data and copy are not class lists. If a constant serves both classes and app data, separate those uses before converting it; never change a data value merely because it resembles a utility.

The inventory's `coverage` records unsupported Sass/SCSS/Less stylesheets, CSS-in-JS templates, mixed class/data values and unresolved class expressions or imports. Complete the source conversion for those owners in this same import; do not replace the full conversion with alias-only wiring or skip them to make the check pass. Then rerun analysis. If the source form still needs manual review, supply `reviewCoverage(issue)` in the app-owned analysis script, returning a concise reason only for the exact reviewed owner (path, kind and line where present). Record what was converted or why the owner is intentionally fixed. Unreviewed owners make `graphical-install --check` exit 2; reviewed exceptions remain visible in the report. Use `exclude` only for deliberately out-of-scope files such as non-product output, not unresolved product styling.

The analyzer and installer require Node 20.9 or newer. If Graphical's compiler or CSS parser dependency is missing, reinstall the same editor package with its dependencies; do not add or change app-level tools to satisfy Graphical. The analyzer reads JavaScript, JSX, TypeScript, TSX and CSS independently of the app's bundler. Preserve its framework, router, styling libraries and existing dependency versions; report unsupported source forms at their owners.

## 2. Write the import

`graphical/install/import.json` is the install script's input: `{ "document", "roleMap", "source" }`. Write it with a short app-owned script beside the analysis script, and run it from the app root with `node graphical/install/import.mjs`. `@graphical/editor/install` runs in plain Node and exports the [profiles](profiles.md), `extendRoleMap`, `defineRoleMap` and `DEFAULT_DOCUMENT` for this.

```js
// graphical/install/import.mjs
import { writeFile } from 'node:fs/promises';
import { extendRoleMap, shadcnProfile } from '@graphical/editor/install';

// Every app token and the Graphical token closest to its meaning.
const roleMap = extendRoleMap(shadcnProfile(), {
  remove: ['--spacing'],
  appearance: {
    initial: { navigation: 'subtle', grouping: 'cards', surface: 'outlined' },
  },
});

// The app's own values in Graphical's slots. Install fills the rest.
const document = {
  name: 'Your app',
  theme: {
    colors: { light: {/* … */}, dark: {/* … */} },
    fonts: { body: {/* … */}, display: {/* … */}, data: {/* … */} },
  },
};

// The app's authored value for each mapped variable, per mode.
const source = {
  light: { '--background': 'oklch(1 0 0)' },
  dark: { '--background': 'oklch(0.145 0 0)' },
};

await writeFile(
  new URL('./import.json', import.meta.url),
  `${JSON.stringify({ document, roleMap, source }, null, 2)}\n`,
);
```

- **document.** The app's values in Graphical's slots: the [starting palette](starting-palette.md), neutrals and statuses, the primary action, each font role's family and weights, and the app's own spacing, corners, strokes, shadows and motion where it defines them. Install fills every field you leave out from Graphical's default document, and uses every field you write as written, so write each one whole: `colors` needs both light and dark. The units conversion fits are the exception: type, spacing, corners, strokes, body weights and shadows fit the app's use, with what you write as the starting point. Install uses the inventory’s `appName` as the theme’s display name. Leave `theme.name` out: a Graphical style's name, such as Grove, would switch on that style's own treatments. The shape is the package's `ThemeDocument` type. Read [typography](role-map.md#typography) before filling fonts.
- **roleMap.** Start from the closest [profile](profiles.md), add the app's own tokens and remove roles for variables the app doesn't define. See [role map](role-map.md).
- **source.** Optional, and worth writing: values exactly as the app writes them, including bare channels. Without it, conversion compares against the values the role map resolves from the document, which is less exact.

Older names in the document or role map, such as the `ui`, `brand` and `editorial` font roles or text steps up to `5xl`, are upgraded on install. Write new ones with the current names.

Map tokens as usual, with three rules that matter for conversion:

- Map every color token to the Graphical color closest to its meaning, including tints and variants. A tint names one of its color's translucent levels (`-translucent` is the stronger, `-transparent` the lighter), a lighter or darker variant names the color, and grays name neutrals. Conversion checks each value and decides whether it converts.
- A designed categorical palette, such as the tag, label or chart-series colors people choose from, is part of the app's palette: map it to palette slots after the app's brand and accent colors. Only colors that come from content stay out, in `fixed`. When the app has more than ten palette colors, keep the least-used ones in `fixed`. Conversion orders palette slots by use: Color 1, the key color every Graphical style leads with, becomes the color the app's interface uses most, whatever slot the import gave it.
- Map text that sits on a color (such as an on-accent or button label token) to that color's readable foreground, `on:<color>`, so labels stay legible when a theme changes the color.

Derived numeric roles (`derive: { scale }`) are fine as imported; conversion moves each one onto a single step, a multiple of XXL, or keeps it.

## 3. What conversion does

- **Units.** Conversion maps the app strictly onto Graphical's units: seven body text sizes and seven display text sizes, seven spacing steps, five letter-spacing steps, five corners, three strokes, three weights for each font role and three shadows. Zero, none and full are edges, not units.
- **Fit Body and Display separately.** Body M anchors on the app's base text size, or its most-used Body/Data size when no base size is authored. Each scale fits its own observations, measured in proportion (10px to 12px is as far as 30px to 36px); imported font roles distinguish them even when they share a family. Neighboring sizes stay at least 14% apart. With fewer than two distinct Display sizes, conversion keeps the existing fallback: Body M through XXL, followed by three steps on the same rhythm. Spacing retains its density fit. The fitted result becomes the app's baseline; the Type Scale section's Body / Display selector targets type edits, while the separate Spacing section controls the shared layout scale.
- **Each theme starts at 100%.** After fitting, the resulting concrete values become that theme's own Size and Spacing reference, with Character centered. Preserve the serialized `theme.adjustmentBaseline` in the accepted document. It keeps later adjustments relative to the fitted app rather than Graphical's shared fitting grid; it does not alter the fitted token values. Reopening or regenerating CSS must retain it. Proportion continues to show the actual text ratio.
- **The font role picks the scale.** Display text takes the display scale; body and data text take the body scale. A class list's or rule's text size becomes the text style of its role: display when it sets the display font, body otherwise. Text past Body XXL, such as a hero number in the body face, takes the display scale's step and keeps its face. Text more than 25% from any step stays as authored.
- **Text converts as a unit,** as Graphical's own text does, in class lists, CSS rules and style objects. A text element's size is one of its scale's seven sizes, and its style carries that size's line height and tracking, whether the app set a ratio, a length or nothing. Install removes leading beside a style, on its descendants and on wrappers of converted text; adds the style's line height and tracking to a rule or style object that set only a size; and removes tracking within a step of the style's. Leading that sets a box's height (`leading-none`, zero) stays, as does tracking further from the style's: the report lists both as overrides. App line-height tokens in pixels take the nearest unit's line height.
- **Letter spacing and fonts.** Tracking keeps the system's five steps. A text style pairs with one by size: large text tightens, small text loosens, and a display step pairs as the body step nearest its size does. Each value moves to the nearest step that tightens or loosens the same way, and zero is the middle step. Tracking beyond the steps, such as wide caps tracking, stays as authored. Fonts use their role's token, even when the role names its face through an app variable such as `var(--font-jakarta)`.

When adapting an app-owned typography resolver from numbers to CSS token references, inspect every caller that performs arithmetic. A TypeScript cast does not turn `var(--size-s)` into a number: use valid `calc(...)` for optical offsets or retain an explicitly numeric API where the caller needs one. Preserve authored wide tracking as explicit exceptions in the new system. Do not read the old theme as a second live source or claim those exceptions were retained without checking the resolver's output. Body and Display may use the same family; a family name alone cannot distinguish their roles. Resolve that ambiguity from authored role variables or explicit source semantics.

- **Corners, strokes and weights.** These fit their steps to the app's most-used values. Corners stay at least 2px and 15% apart. Regular anchors on the app's base text weight, its `html` or `body` rule's or the browser's 400, which covers every element without a weight class. Slots the imported document filled from an app token anchor the fit when they follow the same rules, and values defined by app tokens outweigh drifted literals.
- **Snapping.** Every other value moves to its nearest unit in proportion; ties round up.
- **Large spacing.** Spacing beyond the top step becomes a multiple of XXL in quarters or thirds, whichever is nearer, written `calc(var(--space-xxl) * 1.5)` or `calc(var(--space-xxl) * 4 / 3)`. An app on a 4px, 6px or 8px grid keeps its exact values. Negative offsets mirror their unit.
- **Shadows.** Shadow recipes fit onto the three elevation steps by how far they lift their surface. Each step becomes the most-used recipe in its group, as one layer.
- **Geometry.** Widths, heights, sizes, insets and transforms keep their values. Spacing feeds only padding, margins and gaps, so icons and dots keep their shape.
- **Kept as authored.** Values in context-relative units (em, %), inset shadows and shadows that draw an edge stay. The report counts each value kept.
- **Tokens.** Every converted app token becomes a plain alias of one Graphical token; spacing beyond XXL keeps its multiple. Kept tokens move to `fixed`. The result is `graphical/role-map.json`.
- **Colors.** A gray moves to the nearest neutral, and a color to the nearest palette or status color of a similar hue, or of any hue when none is similar. The import's own choice wins a near tie. A tint becomes one of its color's two translucent levels, which take the opacities the app's tints use: the lighter is transparent, the stronger translucent. Palette slots that no converted color uses are removed. Contrast isn't a gate yet.
- **Text on a color.** An `on:` token aliases its color's readable foreground, unless that would turn the app's label from light to dark or back: then it takes the neutral nearest the app's own label color in each mode.
- **Modes.** Color tokens hold a value per mode, so a converted color keeps distinct light and dark values. Sizes, spacing, corners and strokes are the same in both modes; a shadow picks its color per mode.
- **Literals.** Hard-coded values in source map onto the same tokens. A literal color takes the token nearest its light appearance, and that token carries its own dark value.
- **Kinds.** A conversion changes a value's size or shade, never its kind: a negative offset stays negative, zero stays zero, tightening tracking never loosens, `transparent` isn't converted, and a translucent color takes one of its color's translucent levels. A value that would change kind stays as authored and is counted as one the conversion couldn't map safely. That is a conversion bug to report, not something to compensate for.

The scanner covers authored CSS, supported utility strings and recognizable CSS-in-JS objects. Dynamic recipes, third-party defaults and unknown expressions are kept, not claimed as converted. The install report lists, per family, the values that converted, the tokens they became and the values kept as authored.
