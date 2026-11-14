# Build the starting palette from the receiving app

The imported theme should start from the app's actual colors, with **up to ten meaningful palette colors** (`color-1` through `color-10`). Ten is a capacity, not a required count. Don't inherit demonstration colors from a package default, stop after four mapped colors, or invent colors to fill empty slots. Use the available slots when the app has more than four distinct, meaningful accents.

## Find and rank the colors

Inspect the app's theme definitions, consumed CSS custom properties, utility configuration, shared components and actual usages across frontend routes and shared UI packages. Reuse the whole-app style inventory and add source context for dynamic or semantic values the scanner can't resolve. Count authored usage and shared consumer reach, not the size of a vendor color catalog, a generated stylesheet or one rendered page. Exclude unused token definitions, third-party branding and protected chart, map and artwork colors.

Separate palette accents from the neutral ramp and semantic status colors. Neutrals belong in `neutral-1` through `neutral-10`; success, warning and error remain their own roles and don't consume the ten palette slots. Preserve the app's actual brand or primary accent as `color-1`. Rank the remaining meaningful accents by observed use, considering shared components and route coverage. Break ties consistently, so rescanning doesn't reorder slots unpredictably. Keep a small evidence table with source owner, role, original value or values, usage and coverage basis, and assigned slot. State any incomplete analysis rather than claiming a precise app-wide ranking.

## Synthesize from the app's own colors

Normalize equivalent color notation and resolve verified aliases before counting distinct colors. Several definitions of the same color appear once. Treat translucent and transparent levels as part of their solid color's family, preserving their authored alpha. Group real tint and shade families around an existing representative base where their source relationship can be preserved with a verified derivation. Choose representatives from the app; don't average brand colors into invented swatches.

Nearby colors with different meanings, states or contrast requirements remain distinct. Similarity is evidence for a possible family, not permission to merge application values. For more than ten independent palette colors, keep the ten best-supported representatives and record the remaining values as extras. Don't remap extras yourself: [conversion](conversion.md) decides, from the values, which extras fold into a slot and which stay as authored. Designed categorical colors, such as the tag or label colors people choose from, are palette colors; only colors that come from content stay out.

Keep each slot's identity across light and dark modes. A slot represents the same role in both modes, even when its values differ. Use the app's actual counterpart or a verified shared value; don't rank modes independently or manufacture an unsupported dark palette. Honor a single-mode app's existing mode support.

## Seed the document

Write the palette into the imported document's colors in `graphical/install/import.json`, with the neutrals, statuses and primary action. Remove unused optional `color-*` keys carried over from any default document. Don't remove the schema's required `color-1`: if the app has no chromatic accent, use its actual primary-action color and record that fact. Never claim a new accent was discovered.

Check that both modes keep each slot's role and that each mapped role is consumed by actual app UI. The imported document records the app as authored; conversion is the only intended change. Keep uncovered extras explicit. A four-color starting palette is valid only when the analysis supports four meaningful palette colors.
