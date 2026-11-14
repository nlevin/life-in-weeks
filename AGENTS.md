# Agent notes

This app runs on Graphical's design system. Its theme lives in `graphical/` and the
development-only theme editor is mounted in `src/App.jsx` through `graphical/editor-root.jsx`.

- For UI work, follow `GUI.md` and use the current theme with the `graphical-ui` skill, even when a request doesn't mention Graphical. `gui/themes.md` lists the installed tokens and what uses them.
- For prompts copied from the editor ("Copy for agent"), theme changes and package updates, use `graphical-adopt`.
- `graphical-import` did the initial conversion and editor install; `graphical/install/` holds its scripts and report.
- Skills are in `.agents/skills/`.

Use the theme's variables (`--space-*`, `--size-*`, `--radius-*`, `--neutral-*`, the app aliases such as `--ink` and `--paper`) at use sites; don't hard-code values. Don't edit `graphical/generated/`; change the theme, then run `npx graphical-install --theme graphical`.

Keep the editor development-only: nothing under `src/` may import `@graphical/editor` directly.
