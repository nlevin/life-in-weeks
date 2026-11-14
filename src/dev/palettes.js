// Palettes for the development palette explorer: curated starting points and a
// generator. Each palette fills the theme's accent (color-1), the eight category
// colors (color-3 … color-10) and the neutral ramp, in light and dark.
import { hexToOklch, oklchToHex, readableOn } from "./color.js";

const CATEGORY_KEYS = [3, 4, 5, 6, 7, 8, 9, 10].map((n) => `color-${n}`);
const NEUTRAL_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `neutral-${n}`);

// Lightness of each neutral step, and how much of the tint each step carries,
// measured from the app's own warm ramp so every palette keeps its contrast.
const NEUTRAL_L = {
  light: [0.962, 0.98, 0.929, 0.897, 0.851, 0.667, 0.518, 0.39, 0.291, 0.224],
  dark: [0.183, 0.215, 0.25, 0.283, 0.329, 0.545, 0.689, 0.791, 0.872, 0.93],
};
const NEUTRAL_TINT = {
  light: [0.44, 0.36, 0.68, 0.88, 1, 0.96, 0.84, 0.68, 0.56, 0.4],
  dark: [0.25, 0.32, 0.39, 0.43, 0.57, 0.82, 1, 0.96, 0.79, 0.68],
};
// Neighbouring categories alternate lighter and darker so they stay apart.
const LIGHTNESS_STEP = [0.04, -0.1, 0.12, -0.04, 0.08, -0.12, 0.02, -0.06];
// Spread hues so categories next to each other in a lens land far apart.
const HUE_ORDER = [0, 4, 2, 6, 1, 5, 3, 7];

function categories({ hue, span, chroma, lightness }) {
  return HUE_ORDER.map((pos, i) => {
    const h = span >= 300 ? hue + pos * (360 / 8) : hue + (pos / 7) * span;
    return oklchToHex({ l: lightness + LIGHTNESS_STEP[i], c: chroma, h: ((h % 360) + 360) % 360 });
  });
}
function neutrals(mode, { hue, chroma }) {
  return NEUTRAL_L[mode].map((l, i) => oklchToHex({ l, c: chroma * NEUTRAL_TINT[mode][i], h: hue }));
}
function accent(mode, { hue, chroma, lightness }) {
  return mode === "light"
    ? oklchToHex({ l: lightness, c: chroma, h: hue })
    : oklchToHex({ l: Math.min(0.78, lightness + 0.11), c: chroma * 0.95, h: hue });
}

// A palette from its recipe: { name, cats, neutral, accent }.
export function buildPalette(recipe) {
  const cats = categories(recipe.cats);
  const out = { name: recipe.name, recipe, light: {}, dark: {} };
  for (const mode of ["light", "dark"]) {
    out[mode]["color-1"] = accent(mode, recipe.accent);
    CATEGORY_KEYS.forEach((k, i) => { out[mode][k] = cats[i]; });
    neutrals(mode, recipe.neutral).forEach((v, i) => { out[mode][NEUTRAL_KEYS[i]] = v; });
  }
  return out;
}

export const RECIPES = [
  { name: "Clay", cats: { hue: 41, span: 360, chroma: 0.1, lightness: 0.67 }, neutral: { hue: 82, chroma: 0.025 }, accent: { hue: 33, chroma: 0.15, lightness: 0.59 } },
  { name: "Harbor", cats: { hue: 165, span: 125, chroma: 0.085, lightness: 0.64 }, neutral: { hue: 230, chroma: 0.016 }, accent: { hue: 28, chroma: 0.16, lightness: 0.62 } },
  { name: "Orchard", cats: { hue: 15, span: 145, chroma: 0.12, lightness: 0.66 }, neutral: { hue: 95, chroma: 0.02 }, accent: { hue: 150, chroma: 0.13, lightness: 0.52 } },
  { name: "Dusk", cats: { hue: 255, span: 135, chroma: 0.11, lightness: 0.63 }, neutral: { hue: 290, chroma: 0.018 }, accent: { hue: 70, chroma: 0.15, lightness: 0.72 } },
  { name: "Desert", cats: { hue: 25, span: 95, chroma: 0.09, lightness: 0.68 }, neutral: { hue: 70, chroma: 0.032 }, accent: { hue: 205, chroma: 0.12, lightness: 0.55 } },
  { name: "Forest", cats: { hue: 105, span: 120, chroma: 0.085, lightness: 0.6 }, neutral: { hue: 140, chroma: 0.016 }, accent: { hue: 55, chroma: 0.14, lightness: 0.7 } },
  { name: "Nordic", cats: { hue: 230, span: 360, chroma: 0.05, lightness: 0.66 }, neutral: { hue: 240, chroma: 0.012 }, accent: { hue: 245, chroma: 0.14, lightness: 0.55 } },
  { name: "Pop", cats: { hue: 0, span: 360, chroma: 0.16, lightness: 0.7 }, neutral: { hue: 0, chroma: 0 }, accent: { hue: 350, chroma: 0.2, lightness: 0.6 } },
  { name: "Graphite", cats: { hue: 200, span: 360, chroma: 0.035, lightness: 0.62 }, neutral: { hue: 0, chroma: 0 }, accent: { hue: 262, chroma: 0.18, lightness: 0.56 } },
];

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];
// A new harmonious recipe: a base hue, a spread, and an accent that stands apart.
export function randomRecipe(n) {
  const hue = Math.round(rand(0, 360));
  const span = pick([360, 360, Math.round(rand(80, 170))]);
  const tinted = Math.random() < 0.75;
  return {
    name: `Shuffle ${n}`,
    cats: { hue, span, chroma: +rand(0.05, 0.15).toFixed(3), lightness: +rand(0.6, 0.72).toFixed(3) },
    neutral: { hue: pick([hue, hue + 180, 80, 240]) % 360, chroma: tinted ? +rand(0.008, 0.03).toFixed(3) : 0 },
    accent: { hue: Math.round((hue + 180 + rand(-40, 40)) % 360), chroma: +rand(0.12, 0.19).toFixed(3), lightness: +rand(0.55, 0.68).toFixed(3) },
  };
}

// The theme as saved, in the same shape.
export function themePalette(theme) {
  const out = { name: "Current theme", current: true, light: {}, dark: {} };
  for (const mode of ["light", "dark"]) {
    for (const k of ["color-1", ...CATEGORY_KEYS, ...NEUTRAL_KEYS]) out[mode][k] = theme.colors[mode][k];
  }
  return out;
}

// Keep groups from the saved theme while exploring the rest.
export function withLocks(palette, current, locks) {
  const keep = [
    ...(locks.accent ? ["color-1"] : []),
    ...(locks.categories ? CATEGORY_KEYS : []),
    ...(locks.neutrals ? NEUTRAL_KEYS : []),
  ];
  if (!keep.length) return palette;
  const out = { ...palette, light: { ...palette.light }, dark: { ...palette.dark } };
  for (const mode of ["light", "dark"]) for (const k of keep) out[mode][k] = current[mode][k];
  return out;
}

// The app's own color variables that alias a palette color, per mode, from the role map
// (Graphical's editor pins these aliases with its own values, so the preview sets them too).
function aliasValues(roleMap, mode, vals) {
  const out = [];
  for (const t of roleMap?.tokens ?? []) {
    const token = typeof t.token === "string" ? t.token : t.token?.[mode];
    if (typeof token === "string" && token in vals && !t.derive) out.push(`${t.variable}: ${vals[token]} !important;`);
  }
  return out.join(" ");
}

// Graphical's editor paints its Appearance regions (here the top bar and the tray) with
// fixed colors. Measure them with no preview, and note which palette slot each one is.
const toHex = (rgb) => {
  const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (!m || (m[4] !== undefined && +m[4] < 1)) return null;
  return "#" + [m[1], m[2], m[3]].map((v) => (+v).toString(16).padStart(2, "0")).join("").toUpperCase();
};
export function measureRegions(roleMap, current, mode) {
  const byHex = Object.fromEntries(Object.entries(current[mode]).map(([k, v]) => [v.toUpperCase(), k]));
  const out = [];
  for (const region of Object.values(roleMap?.appearance ?? {})) {
    const el = region?.selector && document.querySelector(region.selector);
    if (!el) continue;
    const cs = getComputedStyle(el);
    const slot = (c) => byHex[toHex(c)] ?? null;
    out.push({ selector: region.selector, background: slot(cs.backgroundColor), border: slot(cs.borderTopColor) });
  }
  return out;
}

// CSS that previews a palette over the theme, including Graphical's editor scope.
export function previewCss(p, roleMap, regions = []) {
  const block = (vals, mode) => Object.entries(vals)
    .map(([k, v]) => `--${k}: ${v} !important; --on-${k}: ${readableOn(v)} !important;`).join(" ") + " " + aliasValues(roleMap, mode, vals);
  const scope = "html:root, .graphical-theme.graphical-theme";
  const paint = (vals) => regions.map(({ selector, background, border }) => {
    const decl = [background && `background-color: ${vals[background]} !important;`, border && `border-color: ${vals[border]} !important;`].filter(Boolean).join(" ");
    return decl ? `:is(${selector}):is(${selector}) { ${decl} }` : "";
  }).join("\n");
  return `${scope} { ${block(p.light, "light")} }\n${paint(p.light)}\n@media (prefers-color-scheme: dark) { ${scope} { ${block(p.dark, "dark")} }\n${paint(p.dark)} }`;
}

export { CATEGORY_KEYS, NEUTRAL_KEYS, hexToOklch };
