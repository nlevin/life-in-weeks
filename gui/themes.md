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
| `--success`, `--warning`, `--error` | Graphical defaults | same | none | The app defines no status colors and does not use these yet |

Neutrals 3, 8 and 9 were filled between the app's authored neighbors at import, so the ramp is whole.
The primary action uses `neutral-10` (`primaryActionColor`).

Kept as authored, outside the theme:

- `--veil` (`rgba` wash of the page color at 55%, over the future in Tracks). It has no matching translucent level.
- Chapter and lens colors. People pick these per category; the sample palette lives in `src/model.js` and is content, not theme.
- `--barh` and `--thead`: layout heights, not theme values.

## Type

| Role | Variable | Family | Weights (regular / medium / heavy) |
| --- | --- | --- | --- |
| Body | `--font-body` (app alias `--font`) | Instrument Sans | 400 / 500 / 600 |
| Display | `--font-display` (app alias `--display`) | Fraunces | 400 / 600 / 600 |
| Data | `--font-data` | Instrument Sans | 400 / 500 / 600 |

Both families load from Google Fonts in `index.html` (Instrument Sans 400, 500, 600; Fraunces 400, 600).
Numbers use the body face with `font-variant-numeric: tabular-nums` (the `.num` class).

Body scale (`--size-*`, with `--line-*` and `--letter-spacing-*`): XXS 9, XS 11, S 13, M 15, L 18, XL 21, XXL 24 px.
Display scale (`--display-size-*`): XXS 19, XS 22, S 26, M 30, L 36, XL 42, XXL 49 px.
A text style sets size, line height and tracking together; weight is separate (`--weight-body-*`, `--weight-display-*`).

## Spacing, corners, strokes

- Spacing (`--space-*`): zero 0, XXS 2, XS 4, S 6, M 8, L 11, XL 15, XXL 23 px. Larger gaps are written as multiples of XXL.
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
