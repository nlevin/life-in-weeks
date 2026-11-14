# Install fonts

The active theme has three font roles, body, display and data, and each names a family with regular, medium and heavy weights. Production loads every role's faces through the app's own font setup. The editor loads hosted preview faces from `https://www.graphicalui.com` during development only: never copy a `Graphical Local Preview` alias or a hosted preview URL into the app's font declarations.

## On import

The Graphical theme starts from the app's own faces, so most are already loaded. Connect them and fill the gaps.

1. **Connect each role to a loaded face.** `--font-body`, `--font-display` and `--font-data` must resolve to faces the page actually loads. Where the app's font loader generates an alias, such as a `next/font` variable, the role names that variable in the imported document, for example `var(--font-inter), system-ui, sans-serif`, rather than a family name the loader never registers.
2. **Load all three weights of each role.** Each role defines regular, medium and heavy, and converted text can use any of them. Add missing static weights to the existing loader, or a variable range that covers them.
3. **Keep the rest.** System stacks need no installation. Keep the app's license files and existing loader aliases.

## On theme changes

Read every family and weight from the theme being applied, not only the roles that changed. Use the prompt's asset notes when present; otherwise the package's `style-assets.md` lists official sources, licenses and free fallbacks for Graphical's style fonts. For a family outside those notes, verify its official vendor or Google Fonts source. Don't assume a hosted preview face is free or licensed for the receiving app. A batch that changes only elements leaves the font setup alone.

1. Reuse correctly licensed faces already in the app.
2. Install selected free webfonts from Google Fonts or their official vendor. Use the project's current mechanism (`next/font`, local `@font-face` or its existing asset loader), retaining license files when required. Load the selected static weights or a variable range that covers them.
3. For a paid family, use licensed files the user has supplied for this app. If none are supplied, tell the user that the family requires a web license, link its vendor and name the files and location needed to add it. Install the documented free fallback for the affected roles so the app works now, and state which fallback is active. Don't purchase a license, use trial files or install a different paid face.
4. Keep the paid family first in its role's stack and put the installed free fallback before generic and system families. Preserve unrelated free selections and requested weights. Keep the theme document's role stack consistent with the source stack, so opening the editor can't drop the installed fallback.
5. If no documented free fallback covers an edited paid selection, verify an appropriate free family from an official source and disclose the choice. Report a blocked or gated source or an unavailable weight; don't claim an exact font installation when the stack is only falling back.

## Connect and verify

Connect all three roles to their real consumers. Body text, controls, placeholders, table text and portalled content inherit body; headings and hero text use display; numbers, code and tables use data. Audit distinct families across product, marketing, authentication and other layout branches. Mapping body alone is not evidence that display typography works, or the reverse. Don't replace a weight role with a single hardcoded number.

Verify asset paths and imports and every requested weight, and check the declarations the app consumes. The app must render its fonts without the editor. When browser testing is authorized, check font loading on an ordinary app route and a portalled control. Report a selected paid family and its active free fallback separately.
