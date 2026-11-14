# Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| The install script skips many sites | Source changed after the analysis. Re-run the analysis, then the script. See [install script](install-script.md#skipped-sites). |
| A color disappears or turns black after aliasing | A consumer wraps a channel variable (`hsl(var(--primary))`) that now holds a full color. Point the consumer at the color itself. See [aliases](aliases.md#semantic-colors). |
| Colors are wrong in the import or the report | `format` doesn't match the stored value. Channel variables need `rgb-channels`, `hsl-channels` or `oklch-channels`. |
| A translucent token never applies | Bare channel variables can't carry opacity. Add `alphaVariable`, or map an opaque token. |
| Graphical classes such as `p-m` or `text-body-m` do nothing | The Tailwind preset isn't in `presets`, or the content globs miss the file. See [compiled scales](compiled-scales.md#after-install). |
| Icons, avatars or dots change size | A converted scale reached geometry: `spacing` itself was replaced or aliased instead of padding, margin, gap and space. |
| Tailwind fails the build on `@apply` | The `@apply` names a key the preset replaced. Rewrite it onto Graphical's classes, or keep the key under `extend`; the report's warnings list each one. |
| Bare `rounded` or a kept `p-4` lost its style | The preset doesn't define that key. Keep the keys the report's `scales` lists, or rewrite the classes. |
| Text keeps its old line height | A `leading-*` class or line-height declaration survived next to a text style. Remove it: the style carries its line height. |
| Headings take body sizes | The heading face isn't mapped to `font.display`, or the class list doesn't set the display font. See [typography](role-map.md#typography). |
| The inspector shows Custom for an element | Its value wasn't converted: the site was skipped, kept or preserved, or the token it reads isn't aliased yet. Check the report and the token's definition. |
| A theme edit doesn't reach part of the page | That part still reads an authored value: an unaliased token, a theme-object copy or a kept value. |
| Dark mode doesn't change Graphical's colors | `modes` doesn't match the app's mechanism. Find the class or attribute the app sets, or use `media`. |
| Navigation or Containment rows are missing in the editor | Those regions aren't mapped. See [appearance](appearance.md). |
| Contrast navigation has an extra line | A source edge sits on another element, often a decorative line inside a resize handle. Map that paint with `navigation.separator`; keep the interactive handle. |
| A font falls back to system faces | The role's face isn't loaded through the app's own font setup, or a weight is missing. See graphical-adopt's [fonts](../../graphical-adopt/references/fonts.md). |
| The editor's alternative styles fall back to system fonts | A development CSP blocks `https://www.graphicalui.com` in `font-src`. |
| The editor doesn't appear on a page | That layout branch isn't wrapped, or the mount isn't in the development root. See [installed editor](../../graphical-adopt/references/installed-editor.md). |
| `[graphical]` messages in the console | They name the role or value involved. Fix the mapping or definition they point to. |
| `dynamic usage of require is not supported`, or `Dynamic require of "react" is not supported`, as the editor loads | Packages built before October 16, 2026 left a dynamic React require in their vendored modules. Install a newer package. |
| Another Graphical module throws while the editor loads | A package bug. Report the error, the module path and the package's `version`, with the smallest next step. Don't patch `node_modules/@graphical/editor`. If the user wants to keep going meanwhile, keep the workaround app-owned, pinned to that version and easy to remove, and say so. |

Fix the cause at its owner. Don't work around it with global `!important` rules, component edits or copies of pages.
