// Development-only palette explorer. Previews whole palettes over the app, then
// saves the chosen one into Graphical's theme, so the editor starts from it.
import { useEffect, useMemo, useRef, useState } from "react";
import themeDoc from "../../graphical/themes/graphical.json";
import roleMap from "../../graphical/role-map.json";
import {
  CATEGORY_KEYS, NEUTRAL_KEYS, RECIPES, buildPalette, measureRegions, previewCss, randomRecipe, themePalette, withLocks,
} from "./palettes.js";
import "./palette-explorer.css";

const STYLE_ID = "palette-preview";
function setPreview(css) {
  let el = document.getElementById(STYLE_ID);
  if (!css) { el?.remove(); return; }
  if (!el) { el = document.createElement("style"); el.id = STYLE_ID; }
  el.textContent = css;
  document.head.appendChild(el); // Keep it last, after Graphical's own styles.
}

function Strip({ p, mode }) {
  const v = p[mode];
  return (
    <span className="pe-strip" aria-hidden="true">
      <i className="pe-accent" style={{ background: v["color-1"] }} />
      {CATEGORY_KEYS.map((k) => <i key={k} style={{ background: v[k] }} />)}
      <span className="pe-neutrals">
        {[1, 4, 7, 10].map((n) => <i key={n} style={{ background: v[NEUTRAL_KEYS[n - 1]] }} />)}
      </span>
    </span>
  );
}

export default function PaletteExplorer() {
  const current = useMemo(() => themePalette(themeDoc.theme), []);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(() => [current, ...RECIPES.map(buildPalette)]);
  const [index, setIndex] = useState(0);
  const [locks, setLocks] = useState({ accent: false, categories: false, neutrals: false });
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState([]);
  const shuffles = useRef(0);
  const listRef = useRef(null);
  const mode = typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const chosen = withLocks(list[index], current, locks);
  const dirty = ["light", "dark"].some((m) => Object.keys(chosen[m]).some((k) => chosen[m][k] !== current[m][k]));

  // Preview whatever is chosen while the panel is open; the saved theme otherwise.
  useEffect(() => {
    setPreview(open && dirty ? previewCss(chosen, roleMap, regions) : null);
  }, [open, dirty, chosen, regions]);
  useEffect(() => () => setPreview(null), []);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [index, open]);

  const select = (i) => { setIndex((i + list.length) % list.length); setStatus(""); };
  const shuffle = () => {
    const p = buildPalette(randomRecipe(++shuffles.current));
    setList((l) => [...l, p]);
    setIndex(list.length);
    setStatus("");
  };
  const keys = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); select(index + 1); }
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); select(index - 1); }
    else if (e.key === "Escape") setOpen(false);
  };
  const save = async () => {
    setSaving(true); setStatus("");
    try {
      const res = await fetch("/__palette/save", {
        method: "POST",
        headers: { "content-type": "application/json", "x-palette-save": "1" },
        body: JSON.stringify({ light: chosen.light, dark: chosen.dark }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || `The dev server answered ${res.status}.`);
      setStatus("Saved to the theme. Reloading so Graphical's editor starts from it…");
      setTimeout(() => location.reload(), 700);
    } catch (err) {
      setStatus(`Couldn't save the palette: ${err.message} Restart the dev server if you just pulled these changes.`);
      setSaving(false);
    }
  };

  if (!open) {
    return (
      // data-feedback-toolbar: Agentation treats it as tool chrome, so it stays clickable while annotating.
      <button type="button" className="pe-launch" aria-label="Open palettes" title="Palettes" data-feedback-toolbar=""
        onClick={() => { setRegions(measureRegions(roleMap, current, mode)); setOpen(true); }}>
        {/* A small wheel of the theme's category colors, so it shows the live palette. */}
        <span className="pe-wheel" aria-hidden="true"
          style={{ background: `conic-gradient(${CATEGORY_KEYS.map((k) => `var(--${k}) 0 ${(CATEGORY_KEYS.indexOf(k) + 1) * 45}deg`).join(", ")})` }} />
      </button>
    );
  }

  return (
    <section className="pe-panel" aria-label="Palette explorer" onKeyDown={keys} data-feedback-toolbar="">
      <header className="pe-head">
        <b>Palettes</b>
        <button type="button" className="pe-x" onClick={() => setOpen(false)} aria-label="Close palette explorer">×</button>
      </header>
      <p className="pe-hint">Preview a palette across the app. Use ↑ ↓ to rotate. Saving writes it to the Graphical theme.</p>

      <div className="pe-list" role="listbox" aria-label="Palettes" tabIndex={0} ref={listRef}
        aria-activedescendant={`pe-opt-${index}`}>
        {list.map((p, i) => (
          <div key={i} id={`pe-opt-${i}`} role="option" aria-selected={i === index} className="pe-opt" onClick={() => select(i)}>
            <span className="pe-name">{p.name}</span>
            <Strip p={withLocks(p, current, locks)} mode={mode} />
          </div>
        ))}
      </div>

      <div className="pe-locks" role="group" aria-label="Keep from the current theme">
        <span>Keep</span>
        {[["accent", "Accent"], ["categories", "Categories"], ["neutrals", "Neutrals"]].map(([k, label]) => (
          <button key={k} type="button" className="chip" aria-pressed={locks[k]} onClick={() => setLocks((l) => ({ ...l, [k]: !l[k] }))}>{label}</button>
        ))}
      </div>

      <div className="pe-actions">
        <button type="button" className="btn" onClick={shuffle}>Shuffle</button>
        <span className="grow" />
        {dirty && <button type="button" className="btn" onClick={() => { setIndex(0); setLocks({ accent: false, categories: false, neutrals: false }); }}>Discard</button>}
        <button type="button" className="btn pri" disabled={!dirty || saving} onClick={save}>{saving ? "Saving…" : "Save to theme"}</button>
      </div>
      {status && <p className="pe-status" role="status">{status}</p>}
    </section>
  );
}
