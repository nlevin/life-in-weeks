import { Fragment, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import {
  BIG, ageOf, bornNote, catOf, clamp, dateW, eb, evLabel, findSpan, isoW, lensBy, moveEdge, newCat, nowI,
  onColor, paint, spanAt, spanW, uid, wLabel, yearOf, yrs,
} from "../model.js";
import { dragWin, hideTag, scrollerOf, showTag } from "../drag.js";
import { Breakdown, EndHandle, ThemeSwatches } from "../shared.jsx";

const PY = 40; // pixels per year
const ty = (w) => (Math.min(w, spanW) / 52) * PY;

// 2 · Tracks: a vertical timeline with one column per lens.
export default function Tracks({ life }) {
  const { state, update, snap, unsnap } = life;
  const T = useRef({ sel: null, justDragged: false, focus: false, onSeam: null }).current;
  const [, rerender] = useReducer((x) => x + 1, 0);
  const [readW, setReadW] = useState(0);
  const tbRef = useRef(null), thRef = useRef(null);

  const tW = (y) => Math.round(((y - tbRef.current.getBoundingClientRect().top) / PY) * 52);
  const read = () => {
    const tb = tbRef.current, th = thRef.current;
    if (!tb || !th) return;
    setReadW(clamp(Math.round(((th.getBoundingClientRect().bottom - tb.getBoundingClientRect().top) / PY) * 52), 0, spanW - 1));
  };
  const toToday = () => {
    const tb = tbRef.current;
    if (!tb) return;
    const sc = scrollerOf(tb), doc = sc === document.scrollingElement;
    const top = doc ? 0 : sc.getBoundingClientRect().top, h = doc ? innerHeight : sc.clientHeight;
    sc.scrollTo({ top: tb.getBoundingClientRect().top - top + sc.scrollTop + ty(nowI) - h * 0.55 });
  };

  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--thead", thRef.current.offsetHeight + "px");
    read();
  });
  useEffect(() => {
    let raf;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(read); };
    document.addEventListener("scroll", on, { passive: true, capture: true });
    const t = requestAnimationFrame(toToday);
    return () => { document.removeEventListener("scroll", on, { capture: true }); cancelAnimationFrame(raf); cancelAnimationFrame(t); hideTag(); };
  }, []);
  useEffect(() => {
    if (!T.focus) return;
    T.focus = false;
    const el = document.getElementById("tName");
    if (el) { el.focus({ preventScroll: true }); el.select(); }
  });

  // ---- dragging seams and event pins ----
  const down = (e) => {
    const seam = e.target.closest(".seam"), evb = e.target.closest(".tev");
    if (seam) {
      e.preventDefault();
      const id = seam.dataset.span, side = seam.dataset.side;
      snap(); T.onSeam = id + side; rerender();
      let moved = false;
      dragWin((ev) => {
        moved = true;
        const w = tW(ev.clientY);
        let at = w;
        update((st) => { const [L, s] = findSpan(st, id); if (!s) return; moveEdge(L, s, side, w); at = side === "a" ? s.a : s.b; }, { undo: false });
        showTag(ev.clientX, ev.clientY, wLabel(at));
      }, () => { hideTag(); T.onSeam = null; if (!moved) unsnap(); else rerender(); });
    } else if (evb) {
      const id = evb.dataset.ev, y0 = e.clientY;
      let moved = false;
      dragWin((ev) => {
        if (!moved && Math.abs(ev.clientY - y0) < 5) return;
        if (!moved) { moved = true; snap(); }
        const w = clamp(tW(ev.clientY), 0, spanW - 1);
        update((st) => { const x = st.events.find((q) => q.id === id); if (x) { x.w = w; delete x.d; } }, { undo: false });
        showTag(ev.clientX, ev.clientY, wLabel(w));
      }, () => { hideTag(); if (moved) { T.justDragged = true; setTimeout(() => { T.justDragged = false; }, 50); } });
    }
  };
  const click = (e) => {
    if (T.justDragged) return;
    const w = clamp(tW(e.clientY), 0, spanW - 1), t = e.target;
    const evb = t.closest(".tev"), sp = t.closest(".tspan");
    if (evb) { T.sel = { type: "ev", id: evb.dataset.ev }; rerender(); }
    else if (sp) { T.sel = { type: "span", id: sp.dataset.span, w }; rerender(); }
    else if (t.classList.contains("lane")) {
      const lid = t.dataset.lens;
      T.focus = true;
      update((st) => {
        const L = lensBy(st, lid);
        const a = Math.max(0, ...L.spans.filter((s) => s.b <= w).map((s) => s.b)), nx = L.spans.filter((s) => s.a > w).map((s) => s.a), b = nx.length ? Math.min(...nx) : BIG;
        const s = paint(L, a, b, newCat(st, L, "Untitled").id);
        T.sel = { type: "span", id: s.id, w };
      });
    } else if (t.classList.contains("t-evlane")) {
      T.focus = true;
      update((st) => { const ev = { id: uid(), label: "New event", w }; st.events.push(ev); T.sel = { type: "ev", id: ev.id }; });
    }
  };

  // ---- actions on the selection ----
  const done = () => { T.sel = null; rerender(); };
  const onSpan = (fn, opts) => update((st) => { const [L, s] = findSpan(st, T.sel.id); if (s) fn(st, L, s); }, opts);
  const setCat = (catId) => onSpan((st, L, s) => { T.sel.id = paint(L, s.a, s.b, catId).id; });
  const newCatFor = () => { T.focus = true; onSpan((st, L, s) => { T.sel.id = paint(L, s.a, s.b, newCat(st, L, "Untitled").id).id; }); };
  const split = () => { T.focus = true; onSpan((st, L, s) => { const ns = paint(L, T.sel.w, s.b, newCat(st, L, "Untitled").id); T.sel = { type: "span", id: ns.id, w: ns.a }; }); };
  const clearSpan = () => { onSpan((st, L, s) => { L.spans = L.spans.filter((x) => x !== s); }); T.sel = null; };
  const delEvent = (id) => { T.sel = null; update((st) => { st.events = st.events.filter((e) => e.id !== id); }); };
  const delLens = (id) => { T.sel = null; update((st) => { st.lenses = st.lenses.filter((l) => l.id !== id); }); };
  const addLens = () => { T.focus = true; update((st) => { const L = { id: uid(), name: "New track", cats: [], spans: [] }; st.lenses.push(L); st.active = L.id; T.sel = { type: "lens", id: L.id }; }); };
  const setEvDate = (e) => { const w = dateW(e.target.value), v = e.target.value; if (w == null) return; update((st) => { const x = st.events.find((q) => q.id === T.sel.id); if (x) { x.w = w; x.d = v; } }); };

  // ---- tray ----
  const sel = T.sel;
  let tray = null;
  if (sel?.type === "span") {
    const [L, s] = findSpan(state, sel.id);
    if (s) {
      const c = catOf(L, s.cat), can = sel.w > s.a && sel.w < eb(s);
      tray = (
        <>
          <div className="chips">
            {L.cats.map((k) => <button key={k.id} className="chip" aria-pressed={k.id === c.id} onClick={() => setCat(k.id)}><i style={{ background: k.color }}></i>{k.label || "Untitled"}</button>)}
            <button className="chip dash" onClick={newCatFor}>New</button>
          </div>
          <div className="ctx">
            <div className="row">
              <input className="txt grow" id="tName" value={c.label} aria-label="Name" autoComplete="off" onChange={(e) => onSpan((st, l, x) => { catOf(l, x.cat).label = e.target.value; }, { undo: false })} />
              <button className="btn pri" onClick={done}>Done</button>
            </div>
            <ThemeSwatches value={c.color} onChange={(color) => onSpan((st, l, x) => { catOf(l, x.cat).color = color; })} />
            <div className="row" style={{ marginTop: "var(--space-m)" }}>
              <span className="grow num">{wLabel(s.a)} → {wLabel(s.b)}</span>
              {can && <button className="btn" data-act="split" onClick={split}>Split at age {ageOf(sel.w)}</button>}
              <button className="btn del" onClick={clearSpan}>Clear</button>
            </div>
          </div>
        </>
      );
    }
  } else if (sel?.type === "ev") {
    const e = state.events.find((x) => x.id === sel.id);
    if (e) tray = (
      <div className="ctx" style={{ margin: "var(--space-zero)" }}>
        <div className="row">
          <input className="txt grow" id="tName" value={e.label} aria-label="Event name" autoComplete="off" onChange={(ev) => update((st) => { st.events.find((x) => x.id === e.id).label = ev.target.value; }, { undo: false })} />
          <button className="btn del" onClick={() => delEvent(e.id)}>Delete</button>
          <button className="btn pri" onClick={done}>Done</button>
        </div>
        <div className="row" style={{ marginTop: "var(--space-m)" }}>
          <input type="date" className="txt" style={{ width: "auto", fontSize: "var(--size-m)", lineHeight: "var(--line-m)", letterSpacing: "var(--letter-spacing-m)" }} value={e.d || isoW(e.w)} onChange={setEvDate} aria-label="Event date" />
          <span className="grow num" id="tEvWhen">{evLabel(e)}{bornNote(e)}</span>
        </div>
        <div className="hint">Set the date here, or drag the pin.</div>
      </div>
    );
  } else if (sel?.type === "lens") {
    const L = lensBy(state, sel.id);
    if (L) tray = (
      <div className="ctx" style={{ margin: "var(--space-zero)" }}>
        <div className="row">
          <input className="txt grow" id="tName" value={L.name} aria-label="Track name" autoComplete="off" onChange={(e) => update((st) => { lensBy(st, L.id).name = e.target.value; }, { undo: false })} />
          <button className="btn del" onClick={() => delLens(L.id)}>Delete</button>
          <button className="btn pri" onClick={done}>Done</button>
        </div>
        <Breakdown lens={L} />
      </div>
    );
  }
  if (!tray) tray = (
    <div className="row">
      <span className="grow" style={{ fontSize: "var(--size-s)", lineHeight: "var(--line-s)", letterSpacing: "var(--letter-spacing-s)", color: "var(--muted)" }}>Tap a striped gap to fill it. Tap the Events column to pin a moment.</span>
      <button className="btn" onClick={toToday}>Today</button>
      <button className="btn" onClick={addLens}>Add track</button>
    </div>
  );

  const n = state.lenses.length;
  const ticks = [];
  for (let a = 0; a * 52 <= spanW; a += 5) ticks.push(a);
  const evNow = state.events.filter((e) => ageOf(e.w) === ageOf(readW)).map((e) => e.label).join(", ");

  return (
    <>
      <div className="t-head" ref={thRef} style={{ gridTemplateColumns: `36px repeat(${Math.max(n, 1)},minmax(0,1fr)) 78px` }}>
        <div className="age num">{ageOf(readW)}</div>
        {n ? state.lenses.map((L) => {
          const s = spanAt(L, readW), c = s && catOf(L, s.cat);
          return (
            <button key={L.id} aria-label={`Edit ${L.name} track`} onClick={() => { T.sel = { type: "lens", id: L.id }; rerender(); }}>
              <small>{L.name || "Untitled"}</small>
              <span className="v">{c ? <><i style={{ background: c.color }}></i>{c.label}</> : <span style={{ color: "var(--faint)", fontWeight: "var(--weight-body-regular)" }}>Not set</span>}</span>
            </button>
          );
        }) : <div></div>}
        <div><small>Events</small><span className="v">{evNow || yearOf(readW)}</span></div>
      </div>
      <div className="t-body" ref={tbRef} style={{ height: ty(spanW) }} onPointerDown={down} onClick={click}>
        <div className="t-axis">{ticks.map((a) => <span key={a} style={{ top: a * PY }}>{a}</span>)}</div>
        <div className="t-lanes">
          {state.lenses.map((L) => (
            <div className="lane" key={L.id} data-lens={L.id}>
              {L.spans.map((s, i) => {
                if (s.a >= spanW) return null;
                const c = catOf(L, s.cat), top = ty(s.a), hgt = Math.max(0, ty(s.b) - top), prev = L.spans[i - 1];
                const showA = s.a > 0 && !(prev && prev.b === s.a), showB = s.b < spanW;
                return (
                  <Fragment key={s.id}>
                    <div className={`tspan${hgt < 34 ? " tiny" : ""}${sel?.id === s.id ? " sel" : ""}`} data-span={s.id}
                      style={{ top, height: Math.max(0, hgt - 1), background: c.color, color: onColor(c.color) }}>
                      <div className="tl"><b>{c.label || "Untitled"}</b><small>{yrs(eb(s) - s.a)} yrs</small></div>
                    </div>
                    {showA && <div className={`seam${T.onSeam === s.id + "a" ? " on" : ""}`} data-span={s.id} data-side="a" role="separator" aria-label={`Drag to move the start of ${c.label}`} style={{ top }}></div>}
                    {showB && <div className={`seam${T.onSeam === s.id + "b" ? " on" : ""}`} data-span={s.id} data-side="b" role="separator" aria-label={`Drag to move the end of ${c.label}`} style={{ top: ty(s.b) }}></div>}
                  </Fragment>
                );
              })}
            </div>
          ))}
        </div>
        <div className="veil" style={{ top: ty(nowI + 1) }}></div>
        <div className="t-evlane"></div>
        {state.events.filter((e) => e.w < spanW).map((e) => (
          <Fragment key={e.id}>
            <div className="tevline" style={{ top: ty(e.w) }}></div>
            <button className={`tev${sel?.id === e.id ? " sel" : ""}`} data-ev={e.id} style={{ top: ty(e.w) }}>{e.label}</button>
          </Fragment>
        ))}
        <div className="nowl" style={{ top: ty(nowI) }}><span>Today</span></div>
      </div>
      <EndHandle life={life} yToYears={(y) => Math.round((y - tbRef.current.getBoundingClientRect().top) / PY)} />
      <div className="tray">{tray}</div>
    </>
  );
}
