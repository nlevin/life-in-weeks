# Theme reference: A life in weeks

This describes the theme as installed in this project. The sources of truth are
`graphical/themes/graphical.json` (the theme document), `graphical/generated/theme.css`
(the variables the app runs on, generated from it) and `graphical/role-map.json`
(the app's own tokens and the Graphical token each one aliases). Read those for exact
values; this page records what is there and how the app uses it.

- Project: `graphical/project.json`, one theme, id `graphical`, named "A life in weeks", active.
- Modes: light and dark, switched by the system preference (`prefers-color-scheme`). `theme.css` writes light at `:root` and dark inside the media query.
- Styling system: plain CSS in `src/styles.css`, plus a few inline style objects in `src/views/`. No Tailwind, no component library.

## Colors

| Graphical token | Light | Dark | App alias | Used for |
| --- | --- | --- | --- | --- |
| `--neutral-1` | `#F6F2EA` | `#14120F` | `--paper` | Page surface, inputs, text on the primary fill |
| `--neutral-2` | `#FBF8F2` | `#1C1915` | `--card` | Trays, chips, answer cards |
| `--neutral-3` | `#EDE7DB` | `#25211C` | none | Not used yet |
| `--neutral-4` | `#E4DCCD` | `#2D2923` | `--line` | Hairlines and control edges |
| `--neutral-5` | `#D6CDBC` | `#3A342C` | `--empty` | Unpainted weeks, empty ribbon |
| `--neutral-6` | `#9C9384` | `#776F61` | `--faint` | Hints, axis labels |
| `--neutral-7` | `#6F675B` | `#A39A88` | `--muted` | Secondary text |
| `--neutral-8` | `#4A443B` | `#C3BAA8` | none | Not used yet |
| `--neutral-9` | `#2F2B24` | `#DCD4C5` | none | Not used yet |
| `--neutral-10` | `#1E1B16` | `#EEE7DA` | `--ink` | Text, the primary action fill, selected chips |
| `--color-1` | `#C8553D` | `#EB7A5E` | `--accent` | This week, destructive labels, active drags |
| `--color-2` | `#3D6FD9` | `#7FA2F0` | `--focus` | Keyboard focus outline |
| `--color-3` … `--color-10` | `#D9805F` `#4F6D8F` `#7FA88B` `#E2B85C` `#9A7CB8` `#5FA3B8` `#C76B8A` `#8C8A5A` | same | none | Chapter and lens colors (see below) |
| `--success`, `--warning`, `--error` | Graphical defaults | same | none | The app defines no status colors and does not use these yet |

Neutrals 3, 8 and 9 were filled between the app's authored neighbors at import, so the ramp is whole.
The primary action uses `neutral-10` (`primaryActionColor`). The app reads it through `--action` and
`--on-action` (role-map tokens `primary` and `primary.foreground`), used by `.btn.pri`, so the editor's
Primary Btn toggle switches primary buttons between ink and the accent.

Chapter and lens colors are palette slots 3–10. Each category stores a reference such as
`var(--color-5)` (`PAL` in `src/model.js`), people pick one from the theme swatches, and text on
them uses `--on-color-N`. The Paint grid is a canvas: it resolves the variables when it draws and
repaints when the theme changes. Older saves with hex colors are mapped to the nearest slot on load.

### Palette explorer (development only)

`src/dev/PaletteExplorer.jsx` adds a Palettes button (a wheel of the category colors) beside
Graphical's GUI button in development; `src/dev/DevTools.jsx` mounts it with Agentation. It previews whole palettes
(accent, the eight category colors and both neutral ramps) over the app, with curated recipes in
`src/dev/palettes.js`, a Shuffle generator and locks to keep groups from the current theme. Saving
posts to a Vite dev-server endpoint (`vite.config.js`), which writes the colors into
`graphical/themes/graphical.json` and runs `graphical-install --theme graphical`. Nothing of it ships
in production builds.

Kept as authored, outside the theme:

- `--veil` (`rgba` wash of the page color at 55%, over the future in Tracks). It has no matching translucent level.
- `--barh` and `--thead`: layout heights, not theme values.

## Type

| Role | Variable | Family stack | Weights (regular / medium / heavy) |
| --- | --- | --- | --- |
| Body | `--font-body` (app alias `--font`) | "Sidebar Geist", "Geist", sans-serif | 300 / 400 / 500 |
| Display | `--font-display` (app alias `--display`) | "Timeless Grotesk", "Geist", sans-serif | 300 / 500 / 500 |
| Data | `--font-data` | ui-monospace, SFMono-Regular, Menlo, monospace | 300 / 400 / 500 |

Geist loads from Google Fonts in `index.html` (variable, 300–500). "Sidebar Geist" is the name Graphical's
editor uses for Geist; the installed Geist follows it in the stack. Timeless Grotesk isn't installed yet,
so display text falls back to Geist until its files are added. Data uses system monospace faces.
Numbers in the interface use the body face with `font-variant-numeric: tabular-nums` (the `.num` class).

Body scale (`--size-*`, with `--line-*` and `--letter-spacing-*`): XXS 8, XS 10, S 12, M 13, L 16, XL 19, XXL 21 px.
Display scale (`--display-size-*`): XXS 17, XS 20, S 23, M 27, L 32, XL 37, XXL 43 px.
A text style sets size, line height and tracking together; weight is separate (`--weight-body-*`, `--weight-display-*`).

## Spacing, corners, strokes

- Spacing (`--space-*`): zero 0, XXS 1, XS 3, S 4, M 6, L 8, XL 11, XXL 17 px. Larger gaps are written as multiples of XXL.
- Corners (`--radius-*`): zero 0, XS 3, S 6, M 8, L 10, XL 12, full.
- Strokes (`--border-*`): none 0, S 1, M 1.5, L 2 px.
- Shadows (`--shadow-s/m/l`): defined but transparent. The app's two shadows (selected tab, tray) are kept as authored.
- Motion: `--motion-duration` 150ms, `--motion-large-duration` 300ms, with their easings.

## Shared pieces and what they use

These are CSS classes in `src/styles.css`, not components.

| Class | Is | Surface | Edge | Corner | Text |
| --- | --- | --- | --- | --- | --- |
| `.bar` | Top bar with the direction tabs | `--paper` | bottom `--line`, `--border-s` | none | Body M |
| `.tabs button` | Direction tab | selected `--card` | none | `--radius-m` | Body M, heavy |
| `.btn` | Button | `--paper`; `.pri` is `--ink` with `--paper` text; `.del` has `--accent` text | `--line`, `--border-s` | `--radius-m` | Body M, medium |
| `.ghost` | Quiet button (Undo, Reset) | transparent | `--line` | `--radius-m` | Body S, medium |
| `.chip` | Lens, brush and example chips | `--card`; pressed is `--ink` | `--line`; `.dash` is dashed | full | Body S, medium |
| `.txt` | Text and date inputs | `--paper` | `--line` | `--radius-m` | Body M |
| `.tray` | Sticky bottom panel | `--card` | `--line` | `--radius-xl` on top | Body S |
| `.ans` | Answer card in Tell | `--card` | `--ink` | `--radius-xl` | Display for the answer |
| `.endh` | Life expectancy drag bar | none | dashed `--faint`; active `--accent` | `--radius-l` | Body S |

Appearance regions in the role map: navigation is `.bar` (blended), cards are `.tray` and `.ans` (outlined).
