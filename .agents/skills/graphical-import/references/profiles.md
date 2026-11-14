# Profiles: start from the app's own styling

Read the app's global stylesheets, theme files, Tailwind configuration and a few representative components, then pick the closest profile. A profile is a starting role map for a common stack. `@graphical/editor/install` exports every profile and runs in plain Node, so build the role map in the import script ([conversion](conversion.md#2-write-the-import)): call the profile, then use `extendRoleMap` to add the app's own tokens, replace roles, set `modes` and `appearance`, and `remove` variables the app doesn't define. A later role replaces an earlier one for the same variable or path.

| What you find | Start from |
| --- | --- |
| `components.json`, `--background`/`--primary`/`--sidebar` variables, `oklch()` values, `@theme inline` | `shadcnProfile()`; see [shadcn/ui](#shadcnui) and [Tailwind v4](#tailwind-v4) |
| The same variables as HSL channels (`--primary: 222 47% 11%`) used as `hsl(var(--primary))` | `shadcnProfile({ tailwind: 3 })`; see [shadcn/ui](#shadcnui) and [Tailwind v3](#tailwind-v3) |
| Tailwind v4 `@theme` variables without shadcn | `tailwindProfile()`; see [Tailwind v4](#tailwind-v4) |
| A `tailwind.config` with values compiled into CSS | `cssVariablesProfile({ tokens })` for the variables the app defines; see [Tailwind v3](#tailwind-v3) |
| Graphical's names: `--size-m`, `--space-m`, `--radius-m`, `--weight-body-medium`, `--color-1` | `graphicalProfile()`; see [Graphical's names](#graphicals-names) |
| The app's own semantic variables (`--color-label`, `--surface-raised`, …) | `cssVariablesProfile({ tokens })`; see [the app's own variables](#the-apps-own-variables) |
| The same variables redeclared in several modules or scopes | `cssVariablesProfile({ root, tokens })`; see [scoped tokens](#scoped-or-repeated-tokens) |
| MUI (`createTheme`, `ThemeProvider` from `@mui/material`) | `muiProfile()`; see [theme objects](theme-objects.md) |
| A JavaScript theme read by styled-components, Emotion, theme-ui or a custom context, with no CSS variables | `themeObjectProfile({ objectRoles })`; see [theme objects](theme-objects.md) |
| A library that publishes its theme as CSS variables (Chakra's `--chakra-colors-*`) | `cssVariablesProfile({ tokens })` on those variables |
| Hard-coded values only | `cssVariablesProfile()` with no tokens: the analysis finds the literals and install rewrites them |

The profiles emit the current names: `font.body`, `font.display`, `font.data` and `weight.body.*`. Older role maps still load; write new roles with the current names.

## shadcn/ui

`shadcnProfile()` is the Tailwind v4 variant; `shadcnProfile({ tailwind: 3 })` reads HSL channels. Colors use `format: "css"` on v4 and `"hsl-channels"` on v3. Modes default to next-themes' `dark` class on `html`; pass `modes` when the app uses another mechanism. The profile maps:

| Variables | Token |
| --- | --- |
| `--background` | `neutral-1` |
| `--foreground`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground`, `--sidebar-foreground`, `--sidebar-accent-foreground` | `neutral-10` |
| `--card`, `--popover` | `{ "light": "neutral-1", "dark": "neutral-2" }` |
| `--primary`, `--sidebar-primary` | `primary` |
| `--primary-foreground`, `--sidebar-primary-foreground` | `primary.foreground` |
| `--secondary`, `--muted`, `--accent`, `--sidebar-accent` | `neutral-3` |
| `--muted-foreground` | `neutral-8` |
| `--destructive` | `error` |
| `--destructive-foreground` | `on:error` |
| `--border`, `--sidebar-border` | v4: `{ "light": "neutral-4", "dark": "neutral-10-transparent" }`; v3: `neutral-4` |
| `--input` | v4: `{ "light": "neutral-4", "dark": "neutral-10" }` with `derive: { alpha: { light: 1, dark: 0.15 } }`; v3: `neutral-4` |
| `--ring`, `--sidebar-ring` | `neutral-7` |
| `--sidebar` | `neutral-2` |
| `--chart-1` … `--chart-5` | `color-6` … `color-10` |
| `--radius` | `radius.m`, `format: "rem"` |

Its navigation region is `[data-slot="sidebar-container"], [data-sidebar="sidebar"]`, painted by `--sidebar` with its edge in `--sidebar-border`, and its cards are `[data-slot="card"]`, painted by `--card`. The v4 variant also includes Tailwind's type, weight and spacing variables; see [Tailwind v4](#tailwind-v4).

Adjust it to the app:

- Move the chart colors to `fixed` when they carry fixed meanings, as charts of data do.
- Remove the roles for variables the app doesn't define, and add `defined` to the ones you can locate, usually the app's global CSS.
- Set `appearance.initial` from what the app does today; see [appearance](appearance.md).

## Tailwind v4

Tailwind v4 utilities read `@theme` variables at runtime. `tailwindProfile()` maps Tailwind's theme variables: fonts (`--font-sans` to body, `--font-serif` to display, `--font-mono` to data), weights (`--font-weight-normal`, `-medium` and `-semibold` to the body role's regular, medium and heavy), tracking (`--tracking-tighter` … `--tracking-wider`), text sizes with their line heights, corners (`--radius-*`), shadows (`--shadow-sm`, `-md`, `-lg`) and the default transition.

Adjust it to the app:

- Remove `--spacing`: Tailwind v4 builds sizes from it too, and geometry keeps Tailwind's own scale. `extendRoleMap(tailwindProfile(), { remove: ['--spacing'] })`; the same applies to `shadcnProfile()`.
- Map `--font-serif` by the text it sets: `font.body` when the app uses its serif for reading text.
- Remove roles for variables the app neither defines nor overrides; the analysis reads Tailwind's defaults on its own. Raw palette utilities such as `bg-zinc-100` are use sites, not tokens: conversion maps each to the nearest neutral or palette color.
- Modes default to the system preference, as Tailwind v4's `dark:` variant does. When the app declares `@custom-variant dark`, pass the class or attribute strategy it names.

## Tailwind v3

Tailwind v3 compiles both default and extended configuration values into CSS. Its scales are values at use sites, not tokens: the analysis reads them from the resolved configuration and the install script rewrites the classes. Map only the variables the app defines, usually semantic colors, with `cssVariablesProfile({ tokens })`, or `shadcnProfile({ tailwind: 3 })` for shadcn. Read [compiled scales](compiled-scales.md) before the analysis.

## Graphical's names

`graphicalProfile()` maps an app that already uses Graphical's exported names to its own tokens: `--color-1` to `color-1` with its `-translucent` and `-transparent` levels, and the same for neutrals and statuses; `--space-{step}`, `--size-{step}`, `--line-{step}` and `--letter-spacing-{step}`; `--tracking-*`, `--radius-*`, `--border-*` and `--shadow-*`; and each font role with its weights. Pass `units: 'rem'` when the app's lengths are in rem. It includes the display scale's variables, `--display-size-{step}`, `--display-line-{step}` and `--display-letter-spacing-{step}`. Older exports use `--font-ui`, `--font-brand`, `--font-editorial` and `--weight-ui-*`, with text steps up to `5xl`: UI is body, Brand and Editorial are display, and the top three text steps are display sizes now.

## The app's own variables

Most custom design systems already keep colors in variables. Map them directly:

```js
const roleMap = cssVariablesProfile({
  modes: { kind: 'class', dark: 'dark' },
  tokens: [
    {
      variable: '--color-background',
      token: 'neutral-1',
      format: 'rgb-channels',
      defined: { path: 'packages/theme/index.ts', symbol: 'semanticThemeColorValues' },
    },
    { variable: '--color-label', token: 'neutral-10', format: 'rgb-channels' },
    { variable: '--color-accent', token: 'color-1', format: 'rgb-channels' },
    {
      variable: '--color-accent-secondary',
      token: 'color-1',
      format: 'rgb-channels',
      derive: { mix: 0.7, with: 'neutral-1' },
    },
  ],
});
```

`format` must describe what the variable holds: a full CSS color (`css`), bare channels (`rgb-channels`, `hsl-channels`, `oklch-channels`), or a length (`px`, `rem`). See [role map](role-map.md#formats).

## Scoped or repeated tokens

Some apps declare their tokens on a wrapper (`[data-theme="daily"]`) or redeclare the same variables in several modules. Set `root` to a selector for one such element. The finish step aliases every declaration of each variable, so repeats can collapse into one shared definition.

Apps with several products and separate token sets need one role map for the product being imported. Ask which product when it isn't clear.
