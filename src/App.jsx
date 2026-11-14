import { useEffect, useState } from "react";
import { useLife } from "./store.js";
import { parseD, sample, todayMs, parse, answer } from "./model.js";
import { scrollerOf } from "./drag.js";
import Paint from "./views/Paint.jsx";
import Tracks from "./views/Tracks.jsx";
import Tell from "./views/Tell.jsx";
import EditorRoot from "../graphical/editor-root.jsx";

const VIEWS = {
  paint: { n: 1, label: "Paint", title: "The grid is the editor", text: "Pick a color, drag it across your weeks, and watch the totals change. Drag the bar under the grid to set your life expectancy.", C: Paint },
  tracks: { n: 2, label: "Tracks", title: "Your life as parallel tracks", text: "Scroll to travel through time; the header reads out every track at that age. Drag a seam to move a boundary. Tap a chapter to rename or split it.", C: Tracks },
  tell: { n: 3, label: "Tell", title: "One line does everything", text: "Type what happened in plain words and it lands in the right place. Ask a question in the same box. Tap any line of your story to rewrite it.", C: Tell },
};
const fromHash = () => (VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : "paint");

export default function App() {
  const life = useLife();
  const { state, update, undo, canUndo, getState } = life;
  const [view, setView] = useState(fromHash);

  useEffect(() => {
    const on = () => setView(fromHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => {
    if (import.meta.env.DEV) window.__t = { parse: (t) => parse(getState(), t), answer: (t) => answer(getState(), t), state: getState };
  }, [getState]);

  const go = (name) => {
    setView(name);
    try { location.hash = name; } catch (e) {}
    scrollerOf(document.getElementById("view")).scrollTo(0, 0);
  };
  const reset = () => update((st) => {
    const fresh = sample(st.birth);
    for (const k of Object.keys(st)) delete st[k];
    Object.assign(st, fresh);
  });
  const setBirth = (e) => {
    const ms = parseD(e.target.value);
    if (!ms || ms > todayMs()) return;
    update((st) => { st.birth = e.target.value; });
  };

  const V = VIEWS[view];
  return (
    <EditorRoot route={`/#${view}`}>
      <header className="bar">
        <nav className="tabs" role="tablist" aria-label="Design direction">
          {Object.entries(VIEWS).map(([k, v]) => (
            <button key={k} role="tab" aria-selected={k === view} data-view={k} onClick={() => go(k)}>
              <span>{v.n}</span>{v.label}
            </button>
          ))}
        </nav>
        <div className="sp"></div>
        <button className="ghost" id="undo" disabled={!canUndo} onClick={undo}>Undo</button>
      </header>
      <main>
        <p className="pitch"><b>{V.title}</b>{V.text}</p>
        <div id="view"><V.C key={view} life={life} /></div>
        <footer>
          <label htmlFor="birth">Birthday</label>
          <input type="date" id="birth" value={state.birth} onChange={setBirth} />
          <button className="ghost" id="reset" onClick={reset}>Reset to sample life</button>
          <span>All three directions edit the same sample life, so you can compare them.</span>
        </footer>
      </main>
      <div className="dragtag" id="dragtag" hidden></div>
    </EditorRoot>
  );
}
