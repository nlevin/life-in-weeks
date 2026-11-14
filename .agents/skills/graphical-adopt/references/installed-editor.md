# Install the editor across app pages

Import mounts the editor once, and later changes keep it working. `GraphicalInstalledEditor` from `@graphical/editor/native` supplies the theme editor and the direct page style inspector on every app page in development. It opens on Theme, with a persistent Theme / Design switch. Design without a selection says “Click to select an element.” Theme keeps the app interactive so navigation and controls work normally. Design enables element selection and shows the selected element’s style controls; choosing Theme clears selection and restores app interaction. Close is available in both modes. Selecting a component edits its shared style or variant when source identity is available; ordinary unannotated elements keep route-instance scope. The panel has no Component tab, gallery or state explorer.

The editor supports browser React DOM apps using the package's declared React/React DOM versions. It has no Next.js or router dependency. Keep the app's framework and routing: the app-owned adapter supplies the committed visible `route`, including for nested or memory routers. Next.js, Vite and other React DOM hosts use the same editor. React Native and non-DOM renderers are unsupported.

## App-owned adapter

The native editor requires each person to connect their own licensed Graphical account. It opens a Graphical sign-in/consent tab, then remembers that browser connection for 60 days. A remembered connection opens the editor immediately while access is verified in the background; an expired or denied connection returns to sign-in without resetting the app or local drafts. Account credentials live in browser storage, never in the app's source or package. A shared repository or installed archive does not sign in other developers. The application remains usable while the editor is signed out or unavailable.

Saving a theme to the account does not write app source. **Copy for agent** carries the accepted theme settings for applying to source; see [account themes](handoff.md#account-themes).

The default account service is `https://www.graphicalui.com`. Pass `accountOrigin` only to point at an explicitly configured local account service, as an exact origin. This value is an endpoint address, not a license or credential. Keep it in the development adapter. The editor rechecks access while online. It stays open through network or service failures while the 60-day remembered sign-in is valid, and closes as soon as the service answers that the sign-in or license is no longer valid.

The adapter resolves `graphical/project.json` through an explicit registry of imported theme files with `readGraphicalProject`. It returns the validated active document, role map and `handoffContext`. Keep the registry in sync when adding themes; do not maintain a second hardcoded active-theme choice. These files are the editor's source baseline, not a parallel production token system. Run the reader inside the lazy adapter module so malformed JSON/schema failures are contained by the loader below.

```tsx
// graphical/installed-editor.tsx — loaded only in development
'use client';

import type { ReactNode } from 'react';
import {
  GraphicalInstalledEditor,
  readGraphicalProject,
} from '@graphical/editor/native';
import '@graphical/editor/styles.css';
import project from './project.json';
import theme from './themes/graphical.json';
import roleMap from './role-map.json';
import { styleOwners } from './style-owners'; // Optional source hints.

const current = readGraphicalProject(
  project,
  { 'themes/graphical.json': theme }, // Include each project theme's imported JSON.
  roleMap,
);

export default function InstalledEditor({
  children,
  route,
  navigationRoute,
}: {
  children: ReactNode;
  route: string;
  navigationRoute?: string;
}) {
  return (
    <GraphicalInstalledEditor
      document={current.document}
      roleMap={current.roleMap}
      handoffContext={current.handoffContext}
      styleOwners={styleOwners}
      route={route}
      navigationRoute={navigationRoute}
      initialPanelOpen
    >
      {children}
    </GraphicalInstalledEditor>
  );
}
```

`initialPanelOpen` opens the editor on Theme when a page loads, so the app shows Graphical straight after import; without it the editor starts as a collapsed launcher. Appearance starts from the role map's `appearance.initial`. The readers validate supported schema versions and fields; the project reader also rejects duplicate IDs/paths, an absent active theme, missing imported JSON and role mappings that cannot resolve against that theme. Keep reader results stable outside render or memoized by their source inputs. The editor follows the app's color mode by the role map's `modes`, and its mode switch sets that class or attribute; pass `colorMode` and `onColorModeChange` when the app's own provider owns the mode, including apps whose role map uses `{ "kind": "bridge" }`. `adoptSkillPath` names the graphical-adopt skill in Copy for agent prompts; pass it when the project's skills live somewhere an agent wouldn't look. Keep the host's theme and application providers: the editor doesn't replace routing, auth, data, styling or portal providers.

For a single-mode host, declare `{ "kind": "fixed", "mode": "dark" }` or `"light"` in the role map. This slot is authoritative for source: the editor starts in it and the generator emits it at `:root`. The footer always offers light/dark preview. For a single-mode host the editor applies a temporary preview through mapped styles and object values without changing the role map or the host's saved mode. Do not create local light/dark state or pass a setter for a mode the app does not support. Legacy `none` or absent `modes` means fixed light; migrate a dark-only app explicitly, preserving its authored dark values. A conflicting `colorMode` prop is ignored and diagnosed.

A `{ "kind": "media" }` host follows the system until the user switches modes in the editor. That switch previews the chosen mode locally without changing the OS: mapped tokens, readable stylesheet color-scheme queries (including constructed/adopted sheets), stylesheet media attributes and native `color-scheme` follow the preview. Other media conditions and rule order remain intact; removing the editor restores the latest host-authored media. A supplied `onColorModeChange` bridge owns mode changes instead. Connect that bridge for JavaScript `matchMedia` consumers or provider-owned themes: the editor does not spoof browser APIs, and cross-origin stylesheets with unreadable nested rules cannot be rewritten.

New project installs include a stable `project.id`. Older projects may omit it and can still render. Readable batches identify the theme by its verified file path; a missing project ID alone does not block them. During an authorized upgrade, add one explicit stable ID to that project file and retain it; never derive it from a route or regenerate it at each mount. The helper's optional fourth argument `{ projectPath: 'path/to/project.json', roleMapPath: 'path/to/role-map.json' }` identifies nonstandard source locations. The role-map path defaults to `role-map.json` beside the project file. Handoff project/theme/role-map paths are relative to the receiving app. The package supplies its own version, so the host normally does not set `packageVersion`.

No component route or client navigation callback is required. Older installations remove Graphical-only gallery routes, fixtures and their imports; preserve source components and shared style identities.

Pass `navigationRoute` only when the outer framework URL differs from `route`, the committed visible page identity used for instance edits. Keep the shared editor mounted during normal app navigation so drafts survive. When one framework URL contains multiple app views or records, publish the committed inner identity from the rendered app through an app-owned bridge. Include a non-sensitive view category in the identity path and private record IDs in its query, so the default copied route remains useful while redacting IDs. The internal identity still distinguishes records; copied instance edits must be verified from their remaining context. Publish committed state only, clear it on unmount, and keep Graphical imports behind the development boundary.

For a JavaScript-theme host (`roleMap.objectRoles` is populated), use the editor's same-document connection: store the optional `onThemeObjectChange` callback's `InstalledThemeObjects | null` value, and pass `applyHostThemeObject(originalTheme, overrides?.[mode])` to the app's existing theme provider. Both exports come from `@graphical/editor/native`. The callback supplies per-mode dot-path overrides; select the slot named by fixed mode for a single-mode provider, while keeping both callback maps intact. During alternate-mode preview, the editor supplies that preview's values through the fixed slot so the existing provider updates without a second mode state. `null` restores the source theme. Keep the callback identity stable, preserve the original theme's unmapped properties and functions, and compute the provider input from the original theme each time. Verify that an actual provider consumer changes; don't replace the app's styling system or claim its object changed because a CSS variable did.

Native `dialog.showModal()` surfaces need no adapter workaround. Graphical keeps its inspector, launcher, selection outlines, text editor and pickers inside the active dialog's modal boundary using an editor-owned top-layer surface. The host retains its dialog and cancellation behavior. Escape clears a selection first, then requests normal dismissal; editor popups and text fields handle Escape before the host dialog. Closing a dialog preserves pending edits. Keep custom document/window capture handlers cooperative with `isGraphicalInteraction` as described below.

## Loading and failure containment

Use `GraphicalEditorLoader` from the small `@graphical/editor/loader` entry point. Its `loadEditor` callback may load the app-owned adapter above: remap that module's default export to the required `GraphicalInstalledEditor` field. This keeps native imports, editor CSS, theme JSON and validation inside the guarded asynchronous import graph.

```tsx
// graphical/development-editor.tsx — loaded only in development
'use client';
import type { ReactNode } from 'react';
import { GraphicalEditorLoader } from '@graphical/editor/loader';

type HostProps = { children: ReactNode; route: string; navigationRoute?: string };
const loadEditor = async () => ({
  GraphicalInstalledEditor: (await import('./installed-editor')).default,
});

export default function DevelopmentEditor(props: HostProps) {
  return <GraphicalEditorLoader<HostProps> loadEditor={loadEditor} {...props} />;
}
```

The app-owned root must also keep its children available while loading this small shell or if that import fails. It has no runtime Graphical imports and uses a compile-time development branch:

```tsx
// graphical/editor-root.tsx
'use client';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';

type HostProps = { children: ReactNode; route: string; navigationRoute?: string };
const loadDevelopmentEditor = process.env.NODE_ENV === 'development'
  ? () => import('./development-editor')
  : null;

export default function EditorRoot(props: HostProps) {
  const [Editor, setEditor] = useState<ComponentType<HostProps> | null>(null);
  useEffect(() => {
    if (!loadDevelopmentEditor) return;
    let active = true;
    void loadDevelopmentEditor().then(
      ({ default: editor }) => { if (active) setEditor(() => editor); },
      (error) => { if (active) console.error('Graphical shell unavailable; app retained.', error); },
    );
    return () => { active = false; };
  }, []);
  return Editor ? <Editor {...props} /> : props.children;
}
```

Use the app's compile-time development condition: `process.env.NODE_ENV === 'development'` for Next/Webpack, `import.meta.env.DEV` for Vite, or the existing bundler's equivalent. Keep the dynamic import directly inside the module-level development conditional. Next/Webpack can still emit the imported editor chunks when the only environment guard is an early return inside an effect. Keep editor CSS imports inside the development adapter reached by that conditional as well.

Keep the shell and its callback outside route-specific component definitions. `GraphicalEditorLoader` renders the app during loading, reports import or render failures, then restores the app without the editor. Its optional `onEditorError(error, { phase: 'load' | 'render', cause: 'validation' | 'runtime' })` hook is local diagnostics; `cause: 'validation'` means the project, theme or role map JSON was rejected. There is no automatic telemetry. Do not validate project JSON or import the native package in the outer shell before `loadEditor` runs, because those errors would bypass the loader. Failure remains disabled for that mount; reload or explicitly remount after repairing it. This boundary does not catch asynchronous event-handler errors, and an app error that repeats in the fallback still reaches the app's own error boundary.

Loading the shell/editor and falling back after a render failure can remount the wrapped app subtree. Keep durable app state/providers above these boundaries, and don't promise preservation of local child state through recovery. Ordinary editor opening/closing and route navigation retain the mounted editor owner. On editor unmount, host overrides are removed and theme-object/portal callbacks receive `null`; those host callbacks must restore their original theme and portal destination. Do not hide an unresolved failure behind a permanent blank fallback.

## Edit page text

The preview changes no application data or source. Copy for agent includes the original and requested wording plus source and route evidence. The receiving agent traces the wording to its literal, translation, prop, fixture or data owner; see [handoff](handoff.md). New app data takes precedence over an old preview. Closing the panel retains committed edits; unmounting removes previews.

## Remove page elements

Copy for agent records source, route and permitted text evidence under `Remove elements`. Applying it removes the identified UI at its source; it is not a request to delete a live data record or every usage of a shared component. The editor itself changes no source or application data.

## Handoff identity and private content

Pass `current.handoffContext` from the project reader. The editor captures that source identity and baseline at session start, so changing a later active theme cannot silently retarget pending edits. The readable batch names the theme file and lists changed values with target context; internal metadata is not copied. See [handoff](handoff.md) for source verification, conflicts and older JSON batches.

Installed batches include short text labels, capped at 80 characters, to help locate selected elements. Route queries/fragments remain omitted by default. `handoffPrivacy` optionally accepts `includeText`, `sanitizeText(text)`, `sanitizeRoute(route)` and `excludeSelector`. Apps that must omit host text pass `handoffPrivacy={{ includeText: false }}`; this explicit choice takes precedence over a text sanitizer. Otherwise a sanitizer can replace a label with permitted context. `data-graphical-private` always excludes that element and its descendants from inspection and handoff text. `excludeSelector` adds host-specific exclusions, including descendant text when selecting a parent. Invalid exclusions and failed sanitizers withhold content. Keep callbacks deterministic and stable. These controls apply to copied context; internal route keys retain the complete committed route so edits cannot leak between redacted views. Path segments can contain sensitive identifiers too, so provide a route sanitizer when the host needs them removed. A redacted copied route is not enough to identify a private record; resolve the exact instance from the remaining evidence or report it as unresolved.

Opening the panel must reserve real horizontal space for the editor and reduce the application's available layout width. The app's right edge and controls must remain visible, reachable and selectable beside it; the panel must never cover the app DOM. Closing the panel restores the app's original available width, scrolling, pointer events and keyboard behavior. The runtime owns this layout and interaction contract; a margin-right patch, clipping hidden content or an overlay that merely looks separated isn't a successful integration.

While open, the runtime places the app viewport and inspector beside one another in a flex layout. The app viewport uses layout containment so fixed descendants stay within that reserved area. Document content scrolls in a separate inner app view, keeping those fixed controls anchored while preserving the document's scroll position across opening and closing. Closing the panel restores the wrapper's `display: contents` behavior so the app resumes its native layout. This doesn't rewrite the receiving app's CSS or make browser viewport units refer to a smaller viewport.

## Root integration and routes

Mount the adapter once in the shared application root, retaining the same React owner and key during navigation. Pass the actual current path, including query details needed to distinguish edited views. Never hardcode a single route. Route identity prevents a one-instance edit on one page leaking onto a similar element on another page.

For embedded, nested or memory-routed views, use the **committed visible inner route**, including resolved detail IDs and meaningful query values. The outer framework pathname may stay unchanged while the user moves between records or pages inside that view; a route template such as `/items/[id]` is also insufficient. Read the router or navigation state that owns the rendered view and publish its actual `asPath` (or equivalent resolved location) after that view commits. Don't publish a requested destination before its content appears.

If the stable root editor sits outside the inner navigation provider, add a small app-owned development identity bridge: the visible page publishes its committed location from an effect, the root subscribes to that value, and the publisher cleans up when leaving that view so the root falls back to its ordinary route. Keep that bridge independent of the editor package and active only in development; no Graphical runtime import belongs in production navigation code. Preserve the editor's mounted owner rather than remounting it to change route identity.

Place the stable mount within the app's existing shared providers: `<AppProviders><InstalledEditor>{page}</InstalledEditor></AppProviders>`. Preserve provider ordering and values across every layout branch. The editor renders the actual app; no sibling specimen tree or gallery provider adapter is needed.

The mounted editor must also enclose the complete visible application shell, not only its flow content. Audit fixed and sticky navigation, `inset: 0` shells, `100vw` and `100dvw` widths, minimum widths, internal scrollers and right-aligned controls, including embed and minimal-layout routes. A narrower ordinary wrapper alone doesn't establish that these elements use the app's reserved area. Where the source intends to fill its available parent, use parent-relative sizing such as `width: 100%` and `min-width: 0`; a shell sized from JavaScript must measure its actual app viewport, for example through its existing `ResizeObserver` integration, rather than always using `window.innerWidth`. Make these narrow changes at the audited source owner, preserving normal full-width behavior when the editor is closed; don't rewrite arbitrary viewport units across the app. Check actual geometry with the panel open and closed and after resizing. Preserve the app's responsive and scrolling behavior; don't force content under the panel, hide the overflow, or replace the real app with an iframe or copied page to satisfy the check.

Audit body-portalled menus, dialogs, tooltips and popovers separately: they don't inherit the app wrapper's layout containment. Their trigger alignment and available space must respect the reserved application area while the editor is open, and their content must remain reachable without covering the panel. Use the receiving primitive's supported positioning or container integration when needed, retaining its refs, focus, dismissal and normal closed-editor behavior. Never assume an arbitrary React portal can be moved safely by rearranging its DOM, or that changing the wrapper's margin fixes it. If the runtime and the app's supported integration still leave a shell or popup covered, report the exact surface as unresolved rather than accepting clipped content.

`GraphicalInstalledEditor` accepts optional `onAppPortalContainerChange?: (container: HTMLDivElement | null) => void`. It reports a `display: contents` portal destination inside the app viewport, which stays mounted across panel open and close. The callback receives `null` when it unmounts. Keep the callback stable.

In the development-only adapter, hold the destination with a stable state setter:

```tsx
const [appPortalContainer, setAppPortalContainer] =
  useState<HTMLDivElement | null>(null);
// Pass onAppPortalContainerChange={setAppPortalContainer}
// to the existing GraphicalInstalledEditor mount.
```

Feed `appPortalContainer` through the app's existing portal provider or a narrow app-owned context, then use the receiving primitive's installed, supported container API at the actual portal owner. Keep this context independent of the editor package: production components consume only the app-owned abstraction, whose absent or null value preserves their original production portal destination and behavior. The editor package remains imported only by the development adapter. Preserve existing explicit portal containers. Graphical doesn't automatically move existing body portals. Wire only the audited app portal owners, and verify their positioning, scrolling and open and close lifecycle in both panel states.

- **Next Pages Router:** mount the failure-safe root in `_app` under its required provider boundary, with all package imports behind the compile-time development branch. Cover every normal return and layout path, including minimal, auth, embed and dashboard branches. Pass the visible router's committed `asPath`, using the development identity bridge above when a nested router owns the page. Keep the editor owner stable and application providers around the page; don't place an outer editor around an already-built provider subtree.
- **Next App Router:** use the client root at the shared layout boundary, keeping package imports inside the development branch. Read pathname and search state through the host router in an appropriate client adapter and pass the committed route. Cover parallel layouts without adding duplicate editors. Preserve server-component and provider boundaries. Loading only after mount keeps the initial server/client output as the app itself.

Package imports and editor CSS must be excluded from production through the framework's build-time branch or exclusion mechanism. Hiding a production-mounted editor or testing only `window.location` is insufficient. `graphical/generated/theme.css`, the app's token aliases and its installed fonts remain available without the editor.

## Development assets

The editor's alternative styles and font picker load hosted preview faces and name previews from `https://www.graphicalui.com`. A development CSP needs that origin in `font-src` and `img-src`, and in `connect-src` for background preloading. The editor injects one `<style>` element, so `style-src` must allow inline styles in development. Production needs none of this. If preview images can't load, font names stay readable and selectable.

## Host event interception

Audit app-wide capture listeners, shortcuts and interaction guards that cancel events before they reach their target. Yield when `isGraphicalInteraction(event)` from `@graphical/editor/native` returns true. It recognizes editor chrome and popups, and app and portal targets while selecting. Ordinary app events return false when the editor is closed. Pass the event with its composed path. Register the helper through a development-only callback rather than importing Graphical into production hooks.

Preserve the production exclusion: don't import the editor package directly into a production app-wide hook. If the app has such interceptors, add a small app-owned optional callback and register it from the already development-only adapter:

```ts
// graphical/interaction-boundary.ts — no editor or runtime dependency
type Interaction = {
  target: EventTarget | null;
  composedPath?: () => EventTarget[];
};
type Boundary = (event: Interaction) => boolean;
let boundary: Boundary | undefined;

export function isEditorInteraction(event: Interaction) {
  return boundary?.(event) ?? false;
}

export function registerEditorInteraction(next: Boundary) {
  boundary = next;
  return () => {
    if (boundary === next) boundary = undefined;
  };
}
```

```tsx
// Inside graphical/installed-editor.tsx, loaded only in development
import { useEffect } from 'react';
import { isGraphicalInteraction } from '@graphical/editor/native';
import { registerEditorInteraction } from './interaction-boundary';

// Inside the existing InstalledEditor component:
useEffect(() => registerEditorInteraction(isGraphicalInteraction), []);
```

```ts
// The existing app-wide interaction hook imports only the app-owned callback.
import { isEditorInteraction } from 'graphical/interaction-boundary';

const handleClick = (event: MouseEvent) => {
  if (isEditorInteraction(event)) return;
  // Existing app interception, including preventDefault/stopPropagation.
};
```

Apply the same early return to relevant pointer, keyboard and focus interceptors. Preserve their normal behavior; don't remove listeners or change unrelated app rules. This is a development interaction boundary, not a bypass for authorization, validation or server-side checks. Don't replay events, invoke React internals or patch browser listener methods. Verify that a previously intercepted app control can be selected, that a portalled token option commits, and that the original app guard still works with the editor closed.

## Session edits and applying source

Edits preview immediately but do not write app source, and account saves are separate from applying source. **Copy for agent** gathers the theme, appearance, named element assignments and route-scoped edits into one prompt; the user pastes it to an agent to persist it.

For that batch, verify the named theme file against the project registry and resolve each source target. Use its explicit changed paths and `before → after` values, compare them with current source, and apply only those changes. `$token` preserves a named CSS variable assignment; package metadata is not required. Before values retain verified committed inline or stylesheet declarations, including exact aliases; an `observed` value is only rendered evidence. Available Next development source maps resolve captured React frames to app files and render lines without copying source snippets or adding a filesystem endpoint. A render site is not necessarily the component's definition. A nearest component hint helps find source but never expands local scope. Unchanged theme values and token bindings are omitted; absent sections don't request changes. Resolve the exact route, component owner and instance context before editing, or report what remains unresolved when context was withheld. Reuse the role map and keep assignments such as Space M or Body S as live token references; don't freeze them into their current pixel values. Follow [elements](elements.md), [handoff](handoff.md) and [writing theme changes](writing-tokens.md).

After applying a batch, the active theme document, `graphical/generated/theme.css`, the role map's `appearance.initial` and the affected source match the accepted state. A reload starts from source with no pending changes. Keep later unrelated source edits, and report ambiguous or conflicting owners rather than replacing a whole newer theme. Don't promise persistence across a hard reload before the prompt has been applied.

## Verify the installed workflow

Check the actual installed package in the receiving app with a brief smoke check of the affected workflow. These checks are risk-based examples, not a matrix to run across every component, state, mode and route.

- Inspect the changed source, selected asset imports and the development-only root mount. Confirm the theme renders from source without editor overrides. Check an affected app route over HTTP as an availability signal, not proof of interaction behavior.
- When browser interaction is authorized, open the editor on a representative app page. Confirm the app fits beside the panel, scrolling and a harmless interaction work, and closing restores its normal layout. Include a fixed shell or body-portalled popup only when that integration was affected or presents a concrete unresolved risk.
- Select a title or label, assign a token, and undo. Its subtitle or description and unrelated parts must remain unchanged. Check a verified shared part separately when shared scope was requested; uncertain targets may correctly remain instance-only. Don't claim every matching-looking element shares a source owner.
- When routing or scope changed, navigate to a representative supported destination and verify the committed visible route and edit session. Instance edits must stay on their recorded usage; shared edits must stay on their verified source part and variant. Copy a relevant batch and inspect its scope evidence. Apply it only when source application is the requested task.
- After applying a requested batch, reload and confirm the affected changes persist from source with no pending overrides. Check that a changed named assignment still follows its token. Reuse prior valid checks for unchanged assets and bindings rather than repeating them all.

Follow the skill's verification rule. Don't start browser automation unless the user and the applicable project policy authorize it. Report any actual unresolved mount, target, asset or persistence issue accurately; don't turn an intentionally narrow instance edit into a shared-edit claim.
