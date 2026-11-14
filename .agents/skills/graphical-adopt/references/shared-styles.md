# Shared styles from page selection

The installed editor inspects the actual page. It has no component browser, search, state inventory or specimen manifest.

## Source identity

Trace a selected control to its existing source owner, specific styled part and variant. The package uses available React development ownership and creation-site evidence automatically; installation does not require adding identifiers across the app. Share only when that evidence establishes the same part and variant. A shared React owner, identical tag, matching classes, computed appearance or nearby DOM position alone does not establish shared style scope.

Title and subtitle, label and description, value and caption are independent parts even inside one component or when their initial styling matches. An edit to one must leave the others unchanged. If source metadata is missing, truncated or ambiguous, keep the selected instance as the fallback rather than guessing a shared group. A conservative one-instance edit is preferable to changing unrelated content.

Preserve existing verified development-only `data-graphical-component`, `data-graphical-part` and `data-graphical-variant` markers. Optional explicit metadata can resolve a known ambiguity when backed by the real source, but do not manufacture broad identities or require a host-specific annotation pass to make selection work. Parts and variants must remain distinct; nested components retain their own identity.

Use the same owner/part/variant identities on portalled surfaces through the receiving library's supported slot/container APIs. Confirm attributes reach real DOM nodes rather than context-only providers. Preserve props, refs, behavior and accessibility. Keep markers development-only; source application changes the actual class, token assignment or variant branch rather than shipping CSS against inspection markers.

Optional `styleOwners` supply labels and source evidence to `GraphicalInstalledEditor`. They contain no component imports, renderers, examples or state lists:

```ts
import type { ComponentStyleOwner } from '@graphical/editor/native';

export const styleOwners: readonly ComponentStyleOwner[] = [
  {
    id: 'button',
    label: 'Button',
    source: { path: 'components/button.tsx', exportName: 'Button' },
  },
];
```

This metadata is a lookup for selected styles, not a required exhaustive component inventory or proof that every descendant shares one style. Source hints alone do not grant shared scope; a label alone does not connect an app component.

## Applying edits

A verified shared Primary Button edit changes only that source part and variant for matching instances. It must not affect Secondary Buttons, the button's separately styled description, intentional call-site exceptions or behavior. Preserve existing hover, focus, disabled and open treatments. If a selected part exposes a real state identity, preserve its scope; do not manufacture state fixtures or offer a state browser.

Apply the scope actually recorded in each handoff target. Instance-only or uncertain targets stay on their identified usage and visible route; a component name or an overall "shared edits" heading must not promote them to all instances. A repeated local collection, when verified, is limited to that collection's part. Locate the source before applying; never persist generated DOM locators. If the current source cannot establish the requested target, report that target as unresolved rather than broadening it. State honestly when an edit affects only one instance. See [elements](elements.md) for named token assignments and conflict-aware source application.

When updating an older installation, keep its verified component/part/variant markers and source hints. Remove only Graphical gallery fixtures, routes and navigation wiring; preserve the app's actual components.
