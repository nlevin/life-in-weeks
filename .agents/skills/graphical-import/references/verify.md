# Verify the install

Source checks establish recorded conversion coverage; they do not establish rendered fidelity or runtime behavior. Keep the runtime part brief: a smoke check, not a visual design review or a matrix of every route, state and mode.

## Source

- Re-run `graphical/install/analyze-styles.mjs`, then `npx graphical-install --check`. Resolve remaining convertible and unresolved sites; keep supported exclusions explicit. See [install script](install-script.md#check-the-install). This checks the inspected source, not every runtime state or dependency. Trace affected shared definitions to actual consumers, including compiled utilities, independent typography roles and portal scopes; the running-app checks below remain separate.
- The report's overrides are the only text that keeps values beside its style. Each has a reason; there's nothing to fix.
- `graphical/generated/theme.css` and `graphical/generated/aliases.css` are each imported once, and the app defines no converted token with an authored value. The install's warnings list any channel reads left.
- For Tailwind 3, the preset is in `presets` and the converted scales are gone from the configuration. For Tailwind 4, `graphical/generated/tailwind-theme.css` follows `@import "tailwindcss"`.
- Every entry under Choices that now match is settled, and repeated multiples have homes. See [readable styles](readable-styles.md).
- The project's formatter has run over the rewritten files since the Tailwind config was wired, so its class-sorting plugin knows Graphical's classes.
- The editor, its CSS and its imports load only in development.

## The running app

- Start the dev server with the app's documented script and environment, or reuse one already running that way. If a secrets loader or service fails, use the project's documented local alternative; don't swap in a bare framework command that drops required configuration. Restart after environment changes.
- Load the home page and one detail page, such as a record with a long title, a list or a form. Check the browser console, the framework's error overlay, failed startup requests and the server log. An HTTP 200 can precede a client error, and a module that fails to load in the browser shows only in the console or the overlay. If a Graphical module throws, see [troubleshooting](troubleshooting.md).
- If a page needs sign-in, ask the user to sign in in the browser. Don't bypass authentication, create accounts or invent credentials.
- Look for what conversion can break: lost negative offsets, misaligned checkboxes, doubled borders and changed wrapping in long titles. Report a break as a conversion bug, with its value and site, rather than patching app code to hide it.

## The editor

- The editor is mounted on ordinary pages and shows its sign-in panel. Installing signs no one in, and each person connects their own Graphical account. Don't sign in for the user, create an account or ask for credentials; the app-side checks above are enough to report the install.
- Only if the user has connected their account and asks you to check further: it opens on Theme. Select a heading and a list row. Typography shows Font, Size and Weight sliders using the active roles and tokens. An independent line-height/tracking override or custom size exposes separate Text size, Line height and Letter spacing controls. Check the inspector's spacing, corners and color against the selected element's actual declarations; don't treat every independent typography choice as drift.
- Make one theme edit, such as Spacing or a color, and confirm the page follows. Then undo it.

## Policy

Follow the project's browser-review policy and the user's restrictions. When browser checks are unavailable or prohibited, finish the source checks and report **installed; runtime verification pending**, with the home page URL and the focused check the user can make.
