# Run the install script

`npx graphical-install` runs `installConversion()` from `@graphical/editor/install`. It's Node-only: no React and no CSS imports.

```sh
npx graphical-install [--root .] [--inventory graphical/install/style-inventory.json] [--input graphical/install/import.json] [--keep <value key>]… [--dry-run] [--no-tidy]
npx graphical-install --check
```

Run it where the package is installed, usually the app root. In a monorepo, run it in the app's workspace and pass `--root` when the app root differs. `--inventory` and `--input` default to the files the import wrote in `graphical/install/`, and the project files go in the folder that holds it.

## What it does

- **Converts.** It runs `convertAppStyles` itself, with the saved inventory, `graphical/install/import.json` and any kept value keys. It fills what the imported document leaves out from Graphical's defaults. See [conversion](conversion.md#3-what-conversion-does).
- **Writes the project files** in `graphical/`, in three places, so it's clear which files people edit, which tools write and which only record the import. The theme is named after the app (`appName` from the style inventory) and is active.
  - The project: `project.json`, `themes/graphical.json`, `role-map.json`, and a `README.md` that says what each folder holds. People change these through the editor and the skills.
  - `generated/`: `theme.css`, and the files that read it. `aliases.css` holds the app's tokens as aliases of Graphical's, for tokens the app defines in JavaScript ([aliases](aliases.md)). For Tailwind 3, `tailwind-preset.cjs`, and `tailwind-colors.cjs` when the app's colors are channels; for Tailwind 4, `tailwind-theme.css` ([compiled scales](compiled-scales.md#after-install)). `tailwind-merge.cjs` when the app uses tailwind-merge. Each names its source and how to regenerate it; nobody edits them.
  - `install/`: the report, `install-report.json` and `install-report.md`, beside the analysis and import scripts and their outputs. Nothing at runtime reads this folder.
- **Rewrites every use site in the conversion's table, by syntax.** Class strings in string literals, template literals and `cn`/`clsx` arguments; CSS declarations; style objects.
- **Converts text as a unit,** in class lists, CSS rules and style objects alike. A size becomes the text style of its role: display when it sets the display font or runs past Body XXL, body otherwise. The style carries its line height and tracking, so install removes leading beside it, on its descendants (`[&_li]:leading-7`) and on wrappers of converted text, and tracking within a step of the style's, and adds both to a CSS rule or style object that set only a size. It reads class strings named through constants, such as `${titleSizeClass}`.
- **Keeps what isn't the style's** and lists it in the report's overrides: leading that sets a box's height (`leading-none`), tracking more than a step from the style's, and values kept as authored.
- **Rewrites channel reads.** When the role map marks a token as channels, its `rgb(var(--x) / 0.5)` reads become `color-mix(in srgb, var(--x) 50%, transparent)`, since the token now holds a full color.
- **Names corners and strokes `corner-*` and `edge-*`:** `rounded-lg` becomes `corner-s`, `rounded-t-xl` becomes `corner-t-m`, and `border-2` becomes `edge-l`. Tailwind's own `rounded-*` and `border-*` keep their meaning, so a directional class such as `rounded-s` or `border-l` never reads as a step. Bare classes take Tailwind's defaults on the converted scales: `rounded` and `rounded-t` become the radius step nearest 4px, and `border` and `border-l` become `edge-m` and `edge-l-m`. Border colors stay `border-*`.
- **Checks before writing.** Inventory hashes must match the current source. Stale or unreadable input aborts a write. All destinations are checked and all output is formatted and staged before replacing source. Files are compared again before replacement so a concurrent edit is not overwritten. Existing malformed or future-version project metadata is an error, never an empty project.
- **Rewrites token definitions written in CSS as aliases,** in every rule that defines them: a global `:root` and dark block, or each CSS module's own copy of the palette. A definition under the dark selector takes the dark alias. Definitions in JavaScript, such as a Tailwind plugin or a theme package, stay for `aliases.css` to replace.
- **Never touches** geometry, preserved values or kept values.
- **Cleans up what conversion leaves,** in the class lists it rewrote:
  - It removes a class it made a duplicate of another in the same string, such as `text-sm text-[14px]`.
  - It drops a `cn()` argument or class-list entry it emptied, such as `open && 'leading-6'` once the style carries the line height.
  - It replaces a conditional whose choices it gave the same classes, such as `size === 'md' ? 'text-sm' : 'text-base'`, with those classes, when the condition only reads values.

  The report lists each one under Choices that now match, with any prop the file no longer reads. Install never removes an option: whether the options were meant to match is yours to check. See [readable styles](readable-styles.md#choices-that-now-match).
- **Groups long class lists** it rewrote, eight classes or more across three groups or more. Groups run layout, box (spacing, corners and strokes), type, appearance (color and effects), then states and breakpoints, one string each. A `cn()` argument splits into one argument per group. A `className` string takes the helper the file already imports, and a merging helper such as `cn` only when no two of its classes override each other. Lists in files without a helper stay strings. Classes keep their order within a group, so tailwind-merge resolves them as before.
- **Formats the files it writes** with the project's Prettier and config, honoring `.prettierignore`. A source file is formatted only if it was formatted before install. Class-sorting plugins such as `prettier-plugin-tailwindcss` sit this run out: they'd sort Graphical's classes as unknown until the Tailwind config is wired. Run the project's formatter once the config is in place. Pass `--no-tidy` to skip grouping and formatting.

## Dry run first

Before starting the import, record the starting Git commit and pre-existing changes. Preserve a recoverable copy of uncommitted files the import will touch; recording a commit ID or creating a branch alone does not save those edits. Leave installation changes uncommitted unless the user asks otherwise. If the user later authorizes a separate installation commit, it can be the target of a separately authorized `git revert`; revert does not undo uncommitted edits. Do not stage, commit, reset or revert without the user's authorization. The installer never changes Git history and does not maintain a separate rollback system.

Run with `--dry-run` once. It reports without writing anything. Read the counts per family, unresolved sites and warnings. Re-run analysis after any source change. When the report looks right, run the script without `--dry-run`. On failure, read the exact list of replaced files before trying again. A low-level failure can interrupt replacement after preflight; compare against the starting source and preserved edits to review/recover, and do not assume no source changed merely because the command failed. Recovery must preserve unrelated or later edits.

## The report

`graphical/install/install-report.json` is the record of what the import changed, and `install-report.md` is the same report to read. Keep both in the project with the other files.

- `families`: per family, the sites rewritten, line heights and tracking a text style carries instead, sites skipped, uses of the app's own color tokens (such as `bg-background`, which stay and follow the aliased token), and values kept or preserved.
- `changes` and `skipped`: every site, with the class or value it became, or its skip reason and detail.
- `kept`: values that stay as authored, with their value keys and reasons.
- `overrides`: values beside a text style that it doesn't carry. These are the only places the editor shows a text style with overrides.
- `fonts`: the app's font classes and the Graphical role each became.
- `choices`: conditionals and variant maps whose options the conversion gave the same classes, collapsed or not. See [readable styles](readable-styles.md#choices-that-now-match).
- `tidied`: duplicate classes and emptied class strings install removed, and class lists it grouped.
- `multiples`: spacing past the largest step, by multiple, with its uses and files. See [readable styles](readable-styles.md#spacing-multiples).
- `scales`: Tailwind classes on the scales the preset replaces whose keys it doesn't define, such as a kept `p-4`. See [compiled scales](compiled-scales.md#after-install).
- `warnings`: read them all.

## Skipped sites

Resolve every skipped site before verifying. Keep a site's syntax when you rewrite it: a class stays a class, a declaration stays a declaration, a style object stays an object. The same value converts the same way everywhere, so the report's other changes show its target.

| Reason | What to do |
| --- | --- |
| `not-at-line`, `missing-file` | Source changed after the analysis. Re-run the analysis and the script; never apply stale line numbers. |
| `token-definition` | The site is one of the app's token definitions. The alias step covers it; see [aliases](aliases.md). |
| `no-theme-css` | It renders where `theme.css` isn't loaded, such as an API route or a generated image. Leave it as authored. |
| `mode-split` | Light and dark convert to different tokens, or one mode follows an app token. Rewrite it onto a token that carries both modes, such as the app's aliased token. |
| `dynamic-class`, `escaped` | The class is built from an expression, such as `text-${size}`, or escapes characters. Write it as a small map of complete class names, such as `{ sm: 'text-body-s', md: 'text-body-m' }`, using the classes the report shows each value became, so every choice and its effect is in one place and searchable. |
| `unsupported-value` | The value isn't a literal. Rewrite its inputs when they're in source; leave values computed at runtime. |
| `no-class` | Graphical has no class for this utility. Use the Graphical variable in an arbitrary value, such as `scroll-mt-[var(--space-m)]`. |
| `unmapped-target` | The target isn't a Graphical token this use can take. Leave it as authored. |
| `conflict` | Another rewrite changes the same text. Resolve both by hand. |

Leave a site as authored only when the table says so or its value is kept or preserved, and say why when you report.

## Kept values

Kept values stay as authored: values conversion can't move without a visible change, preserved content and any keys passed with `--keep`. Pass `--keep`, with the value key from the report's `kept` list or the conversion, only for values the user asked to keep. Don't keep a value to hide a conversion problem: a value that would change kind, sign or meaning is a conversion bug to report.

Re-run the analysis before every run, so the conversion's table matches the current source.

## Check the install

`npx graphical-install --check` checks recorded source conversion; it does not establish runtime correctness. Re-run the analysis first; then the check converts the fresh inventory onto the installed theme's units without refitting them. It writes nothing. Exit 0 means no remaining changes, unresolved sites or unreviewed style owners, exit 2 means one of those remains, and exit 1 means input or execution failed. Intentional token-definition and no-theme-CSS exclusions and manually reviewed style owners are reported separately. Never treat an unresolved location, unsupported rewrite, incomplete coverage or conflict as a successful conversion. `--check` cannot be combined with `--theme`; use `--theme <id> --dry-run` to preview a theme without writing.

Anything it lists is a site the install missed: resolve it like a skipped site and check again.

## Applying a project theme

`npx graphical-install --theme <id> [--root .] [--project graphical] [--dry-run]` applies another theme of the project instead: it regenerates `generated/theme.css`, the Tailwind preset or theme and `aliases.css` from that theme's document, formatted as install wrote them, and makes it active, without changing source. An unchanged theme writes identical files. graphical-adopt uses it.
