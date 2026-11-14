# Readable styles

The code an import leaves behind is part of the product. Converted files should read as if they were written for Graphical: consistent names, complete class strings and clear ownership. Install does the mechanical part. This reference covers what's left to you, and the conventions to follow in any styles you write or touch.

## What install does

- **Cleans up what conversion leaves.** It removes duplicate classes and class strings it emptied, and replaces a conditional whose choices it gave the same classes with those classes. See [install script](install-script.md#what-it-does).
- **Groups long class lists** it rewrote, in files that import a class helper. See [class lists](#class-lists).
- **Formats** the files it writes with the project's Prettier, leaving class sorting to the project's own run.
- **Writes generated files deterministically.** Each has a header naming its source and how to regenerate it. Sections run colors, fonts, body text, display text, spacing, corners and edges, shadows and motion, with steps in order.

## Choices that now match

The report lists the conditionals and variant maps whose options the conversion gave the same classes. In `size === 'md' ? 'text-sm' : 'text-base'`, both options became `text-body-m`. Install collapses the conditional when its condition only reads values, but never removes an option. Settle each entry:

- **Meant to differ:** give one option its own step, such as `lg: 'text-body-l'`. Pick the style the design intends, not the nearest pixel.
- **Meant to match,** such as a one-pixel difference the conversion rightly merged: the option no longer changes anything. Where the report says nothing reads a prop now, remove the prop and the callers' uses of it only if it does nothing else. If you can't tell, keep the option and mention it when you report.

Don't restore the old values to keep options apart: a value off the scale is a regression.

## Variant maps

Prefer small, explicit maps of complete class names over classes built from strings, such as `` `text-${size}` ``:

```tsx
const textSizes = {
  sm: 'text-body-s',
  md: 'text-body-m',
  lg: 'text-body-l',
} as const;
```

The choices and their effects stay together, every class is searchable, and install can convert them. The report's `dynamic-class` skips are the places to rewrite.

## Class lists

Keep short class lists inline. Put longer ones in groups, one string each, with the helper the file already uses:

```tsx
className={cn(
  'flex items-center gap-m',
  'px-l py-s corner-m',
  'font-body text-body-m font-medium',
  'bg-background text-label',
  selected && 'bg-background-selected',
  className,
)}
```

The groups run in this order:

1. Layout: display, position, flex and grid, gap and size.
2. The box: padding, margin, corners and strokes.
3. Type: the font role, text style, weight, tracking and alignment.
4. Appearance: colors, border colors, shadows, opacity and transitions.
5. States and breakpoints, then conditional classes and the caller's `className`.

Install groups the lists it rewrote: eight classes or more, across three groups or more. Follow the same order in lists you write. With a merging helper such as `cn`, keep classes that override each other in one group and in their order, so the merge keeps the same classes. Format with the project's formatter and configuration.

## Spacing multiples

Spacing past XXL is a multiple of it, such as `px-[calc(var(--space-xxl)*13/4)]`. Long expressions like that are hard to scan. The report's Spacing multiples table lists each multiple with its uses and files.

- **A large multiple in a few places** is a layout dimension. Give it a home named for what it is in the app, such as a page gutter or toolbar clearance: a custom property in a CSS rule beside the layout, with its responsive values next to it.

  ```css
  .page-content {
    --page-gutter: calc(var(--space-xxl) * 1.75);
    padding-inline: var(--page-gutter);
  }

  @media (min-width: 1024px) {
    .page-content {
      --page-gutter: calc(var(--space-xxl) * 2.5);
    }
  }
  ```

  In Tailwind, read it with `px-[var(--page-gutter)]`, or `px-(--page-gutter)` in Tailwind 4.
- **A multiple used across the app,** such as XXL × 4/3 for 32px, is ordinary spacing the scale doesn't reach. Don't name it at each use. Report it to the user as a scale decision.
- **Ordinary steps** stay classes: `gap-m`, `px-l`.

## Names

- Keep Graphical's names as they are: `gap-m`, `font-display`, `text-body-l`.
- Corners are `corner-*` and strokes are `edge-*`, with sides such as `corner-t-m` and `edge-b-s`. Tailwind's `rounded-*` and `border-*` keep their own meaning, so `rounded-s` and `border-l` always name a side. Border colors stay `border-*`.
- An edge sets only the stroke's width. Stroke, elevation and focus compose: `edge-m border-neutral-4 shadow-s focus-visible:ring-2`.

## Ownership and composition

- **Keep the path short:** a component reads a Graphical token, or an app alias of one, and the token reads the theme's value.
- **Keep meaningful aliases.** Keep app aliases that name something, such as `bg-background`. Don't add an alias for every declaration.
- **Keep recipes near their components.** Keep shared recipes beside the components that use them. Give complicated state selectors a readable CSS block rather than a long chain of variants. Extract styles when reuse or complexity justifies it.
- **Keep typography composable.** `font-body` picks the face, `text-display-l` the size, line height and tracking, and `font-medium` the weight within the face. A body font at a display size can be intentional, so leave it.

## Files people edit

- **The project:** `project.json`, `themes/` and `role-map.json`. Change them through the editor or the skills.
- **`generated/`:** tools write these files. Don't edit them; edit the theme and run `npx graphical-install --theme <id>`.
- **`install/`:** records of the import and the scripts that made them. Nothing at runtime reads them, so don't import from this folder.
