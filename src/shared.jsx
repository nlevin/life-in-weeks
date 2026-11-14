import { useRef } from "react";
import { ageOf, brkHTML, clamp, nowI } from "./model.js";
import { dragWin } from "./drag.js";

// The bar under the grid or timeline: drag it to change life expectancy.
export function EndHandle({ life, yToYears }) {
  const { state, update, snap, getState } = life;
  const el = useRef(null);
  const set = (v) => {
    v = clamp(v, Math.max(40, ageOf(nowI) + 1), 110);
    if (v === getState().exp) return;
    update((st) => { st.exp = v; }, { undo: false });
  };
  const down = (e) => {
    e.preventDefault();
    snap();
    el.current.classList.add("on");
    const off = getState().exp - yToYears(e.clientY);
    document.body.style.minHeight = document.documentElement.scrollHeight + "px";
    dragWin(
      (ev) => set(yToYears(ev.clientY) + off),
      () => { document.body.style.minHeight = ""; el.current?.classList.remove("on"); }
    );
  };
  const key = (e) => {
    const d = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
    if (d) { e.preventDefault(); snap(); set(getState().exp + d); }
  };
  return (
    <div className="endh" ref={el} role="slider" tabIndex={0} aria-label="Life expectancy in years"
      aria-valuemin={40} aria-valuemax={110} aria-valuenow={state.exp} onPointerDown={down} onKeyDown={key}>
      <span className="grip"></span>
      <span>Drag to set your estimate: <b className="num">{state.exp}</b> years</span>
      <span className="grip"></span>
    </div>
  );
}

export function Breakdown({ lens }) {
  return <div dangerouslySetInnerHTML={{ __html: brkHTML(lens) }} />;
}
