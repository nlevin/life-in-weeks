# Writing theme changes

After import, theme values live in Graphical's project files and the app's tokens alias them, so a theme change rarely touches app source.

| Where the value lives | What to edit |
| --- | --- |
| A theme document, `graphical/themes/<id>.json` | The changed paths, in each mode where they differ. Keep the document's other fields. |
| `graphical/generated/theme.css` and `graphical/generated/tailwind-preset.cjs` | Nothing by hand: `npx graphical-install --theme <id>` regenerates both from the active theme's document. |
| The app's token definitions | Nothing: they alias Graphical's variables. A token that later work needs gets an alias where it's defined and an entry in `graphical/role-map.json`. |
| A JavaScript theme object that holds copies | The value at each changed path. See [theme objects](#theme-objects). |
| Values kept as authored | Nothing, unless the prompt names them. |

Apply changes at those owners; don't replace token references with one-off component literals.

## Details

- **Modes.** A light-only change leaves dark values alone, and the reverse. A single-mode app writes the slot named by `roleMap.modes: { kind: "fixed", mode: "light" | "dark" }`; the generator uses that source slot. The editor can temporarily preview either slot; previewing does not request a change to the app's saved mode. Preserve edits to each named theme slot without mirroring them or changing mode support. Legacy `none` or omitted modes uses light. Do not mirror an edit into the other slot to compensate for a mismatched adapter.
- **Named references.** Use sites keep their tokens. Don't replace `var(--space-m)` or `p-m` with its current pixels.
- **Channels.** A theme object or app variable that stores bare channels keeps storing them; write the channels of the new color.
- **Lengths.** Keep the unit style the app uses (`rem` or `px`).
- **Weights.** Keep each weight within CSS's 1–1000 range. A valid number doesn't guarantee the installed font has that face; see [fonts](fonts.md).
- **Fonts.** A changed family needs its faces installed. Keep the fallback stack. See [fonts](fonts.md).
- **Comments and order.** Keep surrounding comments, ordering and formatting. Don't reformat the file.

## Theme objects

Where a theme object can hold a CSS variable, its paths alias Graphical's variables and need nothing. Paths that hold copies, such as an MUI palette or numbers used in arithmetic, need the new value written. `graphical/role-map.json` lists each path in `objectRoles`, with `defined` naming the file and exported object.

- **Where.** Edit the value inside the theme definition: the light or dark object, the branch of a `getDesignTokens(mode)` function for that mode, or `colorSchemes.light` and `colorSchemes.dark` in MUI options. A path that holds one mode's value, such as theme-ui's `colors.modes.dark`, belongs to that mode.
- **Notation.** Keep the value's type. Numbers stay numbers (`borderRadius: 8`, not `'8px'`). Colors keep the notation their neighbors use.
- **Missing paths.** When the path doesn't exist yet, such as `palette.background.paper` in MUI options that relied on defaults, add it in that place rather than in a new object.
- **Computed values.** When source computes the value (`darken(brand, 0.1)`, a spread from a shared palette), update the input rather than replacing the expression.
- **Direct imports.** Components that import the theme module directly pick up the new values from the same file.

After writing, a reload renders the theme from source without the editor's overrides, and every theme path holds its new value.
