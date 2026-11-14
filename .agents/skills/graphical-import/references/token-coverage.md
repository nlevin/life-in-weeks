# Map every token the UI consumes

Conversion moves what the role map and the analysis can see. A token the map leaves out isn't converted: it keeps its authored value, it isn't aliased, and the editor shows its values as Custom ones that theme edits don't reach. Cover every styling owner the app's UI consumes, across all routes and shared packages, not just the home page.

## Trace styling owners, including states

Inventory the app's shared controls, text, rows, containers and overlays. Follow each effective declaration back to its CSS variable, utility configuration, component variant or theme-provider value. Include hover, focus, selected, checked, disabled, validation and open states where they're implemented. Check pseudo-elements, nested mode scopes and portals: a dialog mounted elsewhere doesn't inherit tokens from the page.

Map the applicable families at those owners:

- **Colors:** surfaces, text, accents, status, placeholders, active indicators and edges, including opacity.
- **Typography:** each font role, its weights, sizes with their effective line heights, and tracking. Standalone leading and inherited line height count; a literal `1.5` can override an otherwise mapped size. See [typography](role-map.md#typography).
- **Spacing and control geometry:** padding, margins (physical, shorthand and logical), gaps and row rhythm. Map ordinary positive and negative margins to spacing tokens, preserving the negative sign. Keep `auto` centering, percentages and responsive expressions as authored. Keep content widths, responsive breakpoints, viewport constraints, aspect ratios, logos and data-driven lengths as authored. A sidebar width isn't spacing just because it's a number.
- **Corners, stroke widths, focus rings and elevation.** Separate edge layers from shadows and keep their composition. A compound shadow's colors are dependencies too.
- **Motion:** shared durations and easing, and existing reduced-motion behavior. Motion isn't converted; mapping it lets the editor change it.

Map missing shared declarations by meaning rather than adding new variables. Use distinct roles or calibrated `derive` ratios where the app has extra steps; conversion decides where each lands. See [compiled scales](compiled-scales.md) for utility systems.

## Icons

The app keeps its own icons and icon dependencies; the import doesn't swap families. The installed editor's icon picker uses the package's own development catalogs. Don't add them to the app's production dependencies. Later icon changes follow graphical-adopt's [icons](../../graphical-adopt/references/icons.md).

## Verify coverage

Keep a concise inventory of the styling owners, the roles they map to and the values deliberately left fixed. Trace shared definitions in source rather than generating a test matrix for every token and owner. After install, the re-run analysis and the report show what stayed as authored. Report remaining gaps; don't claim an owner is converted without evidence.
