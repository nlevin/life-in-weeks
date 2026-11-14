# Appearance: navigation and containers

The editor's Appearance group changes regions the app already has:

- **Navigation**: Blended, Subtle or Contrast.
- **Containment**: Spacing, Dividers or Cards.
- **Card surface**: Flat, Outlined or Raised.

Map these regions in the role map. A row stays hidden when its region isn't mapped.

```json
{
  "appearance": {
    "initial": { "navigation": "subtle", "grouping": "cards", "surface": "outlined" },
    "navigation": {
      "selector": "[data-nav-root]",
      "background": "--nav-surface",
      "border": "--nav-border",
      "separator": ".nav-resize-line"
    },
    "cards": { "selector": ".card, [data-slot=\"card\"]", "background": "--card" },
    "groups": { "selector": ".settings-section" }
  }
}
```

`initial` is the app's current treatment, read from source. On navigation, `background` and `border` name the variables that paint its surface and edge, and `separator` names a separate decorative edge. All three are optional.

## Choosing selectors

- **Navigation**: trace the outer navigation composition and choose the element that paints the app's main navigation surface, such as a sidebar or top bar. Use its existing class, `data-*` attribute or `id`. CSS Modules hash their class names, so use an attribute selector on the stable part, for example `[class*="LeftNav_root"]`.
- **Cards**: the repeated content containers that carry their own surface: cards, panels, list containers.
- **Groups**: peer content sections that separate content with spacing or rules rather than a surface. A name such as `data-editor-section` may belong to a rich-text editor, not the app layout; inspect its component and ancestors before using it.

Follow the app's imports to the actual shared container and navigation components, including side and detail rails. Check every relevant repeated surface; don't assume a class named `card` is the only container. The region selector must target the element that owns the fill and edge, not just its heading or inner content.

Navigation can have a separate divider or resize-handle line as a sibling. Use `separator` for only the decorative paint element; Blended and Contrast suppress that edge. Don't select the whole resize handle: its hit target, layout and dragging must stay usable.

Selectors only describe existing elements. Don't add attributes to components just for Graphical; if a region has no stable selector, leave it unmapped and say so.

## Initial treatment

Set `initial` from what the app does today. A blended navigation shares the page surface. A subtle one uses a slightly different surface. A contrast navigation uses the dark palette in both light and dark page modes, like a dark sidebar in a light app; it never becomes light when the page is dark. Read containers the same way: no surface (spacing), rules between sections (dividers) or surfaces (cards). For cards, read the edge as flat, outlined or raised.

The editor repaints a region only after its choice changes, so a correct `initial` leaves the page as it is. Derive containment from the mapped containers, not the overall page layout: panels with their own fill and edge are Cards even if the main content uses whitespace. Claiming `grouping: 'spacing'` for those panels makes choosing Spacing a no-op. A shadow plus a native stroke still describes a surfaced card; inspect the actual edge and elevation before setting `surface`.

## What each choice does

- **Contrast** applies the dark palette to the navigation in both page modes: every mapped variable takes its dark-mode value there, and the app's own dark class or attribute is set on the region. Switching the page to dark mode keeps the navigation dark.
- **Blended** and **Subtle** set the navigation surface to `neutral-1` or `neutral-2`, through `background` when given. Blended also removes the region's own edge.
- **Spacing**, **Dividers** and **Cards** restyle the mapped containers. Spacing removes their surface and edge; Dividers separates them with rules; Cards uses the selected Card surface. Source border and shadow layers must not survive as duplicate edges.
- **Corners** and **Stroke** come from the converted tokens at their use sites. Region selectors don't replace them for controls elsewhere.
