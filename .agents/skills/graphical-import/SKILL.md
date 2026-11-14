---
name: graphical-import
description: Import an existing app into Graphical. Converts the app's styles onto Graphical's system and installs Graphical and its development editor directly, preserving the receiving project’s existing work. Use when the user runs the Graphical import prompt or asks to import, convert or install their app with Graphical.
---

# Import an app into Graphical

Importing an app installs Graphical. One run converts the app's styles onto Graphical's system, writes the project files and mounts the development editor, in the receiving project’s authorized working branch. When it finishes, the app's own home page runs on Graphical with the editor mounted, ready for the user to sign in with their own Graphical account. Installing signs no one in; the editor opens on Theme once they do. The project holds one theme named after the app: use the app’s visible product name as the analysis `appName` (for example, Credible). Keep its stable ID and path as `graphical` and `themes/graphical.json`; those are file identities, not its display name. Preserve names the user changes later. Record the starting commit and existing changes before import; a branch alone is not a recovery checkpoint.

An import request authorizes the source rewrites, project files, fonts, necessary dependencies and editor mount. Follow any explicit branch request and continue the authorized work. It does not authorize staging, commits, pushes, resets, stashes or deleting branches; obtain explicit authorization for those actions.

This workflow owns the initial conversion. Fit Graphical's scales to the app and convert its values as [conversion](references/conversion.md) describes; generic guidance about preserving values during cleanup must not turn this into alias-only setup. The requested import already establishes scope: don't ask the theme-download scope question or run graphical-convert, graphical-audit or graphical-cleanup as an extra installation phase.

## Before you start

- Read the project's agent instructions and this bundle's `README.md`.
- Check for a browser React DOM app. The installed editor is framework-independent; keep Next.js, Vite, React Router or the app's existing runtime and router. Mount through that app's root, pass its committed visible route, and use its bundler's compile-time development condition. Don't install Next or change the framework. React Native and non-DOM renderers are unsupported.
- Check the supplied package's peer requirements against installed dependencies. The current editor requires React and React DOM 19; report an incompatible host rather than upgrading its framework or React to make installation pass.
- Record the current Git commit, branch and pre-existing changes. Preserve unrelated work and use the user’s requested branch or isolation. A dirty working tree is not permission to commit, stash, reset or discard it. If an overlapping edit cannot be safely preserved, identify the exact conflict before proceeding with that edit. See the checkpoint guidance in [install script](references/install-script.md).

## Steps

1. **Prepare.** Use the user’s requested branch or current authorized checkout, recording the checkpoint before changing source. Follow **Retain the supplied package** in the bundle's `install.md` (resolve `@graphical/editor/install.md` for an installed copy): keep the exact archive inside the app and install it as a development dependency using a project-relative path. Keep every existing version, range, override and lockfile policy, and add only missing compatible dependencies.
2. **Analyze and map.**
   - Analyze every frontend root and shared UI package with an app-owned script, `graphical/install/analyze-styles.mjs`, that calls `analyzeAppStyles` and writes `graphical/install/style-inventory.json`. For Tailwind 3, pass the config file as `tailwindConfig`; the analyzer loads it itself. See [conversion](references/conversion.md#1-analyze-the-whole-app).
   - Find how the app styles itself and start from the closest [profile](references/profiles.md). For compiled scales such as Tailwind v3, read [compiled scales](references/compiled-scales.md); for a JavaScript theme, read [theme objects](references/theme-objects.md).
   - Map the app's tokens by meaning in the [role map](references/role-map.md). Build the [starting palette](references/starting-palette.md) from actual use, and cover every styling owner the UI consumes ([token coverage](references/token-coverage.md)). Map navigation and containers for Appearance ([appearance](references/appearance.md)).
   - Write `graphical/install/import.json` with a short app-owned script beside it: the imported document, the role map and the app's authored values per mode. See [conversion](references/conversion.md#2-write-the-import).
3. **Run the install script.** Run `npx graphical-install --dry-run` from the app root and read the report, then run it without `--dry-run`. It converts the app, rewrites every recorded use site, cleans up and groups the class lists it rewrote, formats with the project's Prettier, and writes the project files and `graphical/install/install-report.md`. See [install script](references/install-script.md).
4. **Put the generated files in place.**
   - Import `graphical/generated/theme.css` once. Install rewrote the token definitions written in CSS as aliases; import `graphical/generated/aliases.css` in place of any it couldn't reach, in JavaScript, and remove those. See [aliases](references/aliases.md).
   - For Tailwind 3, add `graphical/generated/tailwind-preset.cjs` to `presets`, replace the converted scales and, if written, swap in `graphical/generated/tailwind-colors.cjs`. For Tailwind 4, import `graphical/generated/tailwind-theme.css` after Tailwind. See [compiled scales](references/compiled-scales.md#after-install).
   - If written, pass `graphical/generated/tailwind-merge.cjs` to the app's tailwind-merge.
   - Resolve every skipped site and every warning in the report. See [skipped sites](references/install-script.md#skipped-sites).
   - Settle the report's Choices that now match, rewrite `dynamic-class` sites as maps of complete class names, and give large spacing multiples named homes. Then run the project's formatter over the rewritten files. See [readable styles](references/readable-styles.md).
   - Install fonts for each font role. Follow graphical-adopt's [fonts](../graphical-adopt/references/fonts.md).
5. **Mount the editor.** Follow the single canonical [installed editor](../graphical-adopt/references/installed-editor.md) integration: a compile-time development-only shell loads `GraphicalEditorLoader`, which loads the app-owned native adapter. Resolve `graphical/project.json` with `readGraphicalProject` and an explicit theme registry inside that lazy adapter. Configure the real mode strategy, including an explicit fixed light or dark slot for single-mode apps. It opens on Theme. Then register the bundle's skills and guidance as its `install.md` describes, so the editor's later prompts can run graphical-adopt.
6. **Verify.** Re-run the analysis, then `npx graphical-install --check`: no convertible or unresolved sites remain in the inspected source. Trace affected shared definitions to their actual consumers; a changed token alone doesn't establish that compiled utilities, headings or portals use it. This source check does not prove runtime behavior or rendered fidelity. Follow the project's browser-review policy for the brief home-page and detail-page checks in [verify](references/verify.md).
7. **Finish.** Report the result and checkpoint. See [finish](#finish).

## Typography

Text follows Graphical's type system. Map and convert it as described here.

- **Three font roles,** each a family with regular, medium and heavy weights. Body sets all interface and reading text; a blog theme picks a serif here. Display sets headings and hero text. Data sets numbers, code and tables, and isn't always monospaced.
- **Two type scales** with the same seven steps, `xxs` to `xxl`. The body scale sets body and data text; the display scale sets display text. The font role picks the scale.
- **Text styles are lookups.** A style is a step on the scale its font role uses, such as Body M or Display L. It sets the size, line height and tracking together; weight stays a separate choice.
- **Text converts as a unit.** A size takes its style's line height and tracking, in classes, CSS rules and style objects. Install removes the line heights and near tracking a style replaces; what stays is listed as overrides. Don't pair a converted size with a separate line height.

## What changes in the app

- The import changes in the user’s authorized working branch, with pre-existing work preserved.
- A development dependency on the bundled `@graphical/editor` tarball.
- The `graphical/` project folder. Its `README.md` says which files people edit, which tools write and which only record the import:

| File | Holds |
| --- | --- |
| `graphical/project.json` | The project's themes and which one is active |
| `graphical/themes/graphical.json` | The Graphical theme document |
| `graphical/role-map.json` | The converted role map: each app token and the Graphical token it aliases |
| `graphical/generated/theme.css` | Variables for the active theme’s supported mode strategy |
| `graphical/generated/aliases.css` | The app's tokens as aliases of Graphical's, for definitions in JavaScript |
| `graphical/generated/tailwind-preset.cjs` | Graphical's Tailwind 3 classes |
| `graphical/generated/tailwind-colors.cjs` | The app's color tokens for Tailwind 3, when they were channels |
| `graphical/generated/tailwind-theme.css` | Graphical's Tailwind 4 classes |
| `graphical/generated/tailwind-merge.cjs` | Graphical's classes for tailwind-merge, when the app uses it |
| `graphical/install/import.json` | Install's input: the imported document, the role map and the app's authored values per mode |
| `graphical/install/style-inventory.json` | The app's style analysis, from its own `analyzeAppStyles` script |
| `graphical/install/install-report.md` | What install changed, skipped, kept, cleaned up and left as text style overrides, with `install-report.json` beside it |

- The app-owned analysis and import scripts in `graphical/install/`, and the development-only editor adapter.
- Use sites rewritten onto Graphical's tokens and classes, and the app's token definitions rewritten as aliases of Graphical's.
- Fonts for each role, through the app's own font setup.
- Project-local Graphical skills, `GUI.md` guidance and a pointer to them in the agent instructions.

Keep page structure, component behavior, authentication, routing and app data unchanged. Conversion changes tokens and the visual theming language, not the rest of the frontend. Production keeps no Graphical runtime: it renders the converted source, `graphical/generated/theme.css` and installed fonts. The editor and its CSS load only in development.

## Rules

- Convert; don't connect. Graphical's tokens become the definitions and the app's tokens alias them. Don't keep authored values behind new variables to preserve the old look.
- Leave code that reads as if it were written for Graphical: complete class names, Graphical's names (`corner-*` and `edge-*` for corners and strokes), and a short path from component to token to theme value. See [readable styles](references/readable-styles.md).
- Keep the app's semantic token names as aliases. Rewrite number-named utilities and hard-coded values to Graphical's tokens, so names stay truthful.
- Leave geometry (widths, heights, sizes, insets and transforms), preserved values such as content colors and artwork, and kept values as authored.
- A value that would change kind, sign or meaning is a conversion bug to report, not something to patch around in app code.
- Fix a problem at its owner. Don't add global `!important` rules, copies of pages or one-off component patches.
- Keep verification proportional: run at most one existing targeted check if changed behavior warrants it. Don't add tests or test harnesses, or run broad test suites, production builds, broad type or lint sweeps or dead-code audits. If project instructions require broader checks, report that requirement separately. Registering the other Graphical skills doesn't run graphical-audit, graphical-convert or graphical-cleanup.

If something blocks the import, check [troubleshooting](references/troubleshooting.md).

## Finish

Leave changes uncommitted unless the user explicitly requested a commit. Report the actual branch and recorded starting commit; never present deleting a branch as an undo operation. If a dedicated installation commit is later authorized, it provides a reviewable target for a separately authorized revert. Preserve any later or unrelated work during recovery.

Then reply with a link to the app's home page and one line. For example:

> Your app now runs on Graphical: [open it](http://localhost:3000/). It has one theme, named after your app. Sign in to Graphical in the editor panel to start editing. The installation changes remain uncommitted.

Mention any gap that affects what the user sees, such as an active font fallback or a page that needs sign-in. Skip file lists, scripts and verification summaries.

If the import is blocked or unverified, lead with that and the smallest next step. Don't call it done while the home page fails to load or the editor isn't mounted.

Later theme changes, the editor's Copy for agent prompts and package updates use the companion [graphical-adopt](../graphical-adopt/SKILL.md) skill.
