import { useEffect, useLayoutEffect, useReducer, useRef } from "react";
import {
  BIG, activeLens, ageOf, bornNote, catOf, clamp, dateW, eb, fD, findCat, isoW, moveEdge, newCat, nf, nowI,
  paint, parseD, rng, spanAt, spanW, total, totals, uid, wLabel, wMs, yrs,
} from "../model.js";
import { asStop, autoScroll } from "../drag.js";
import { Breakdown, EndHandle } from "../shared.jsx";

const cssv = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

// 1 · Paint: the weeks grid is the editor.
export default function Paint({ life }) {
  const { state, update, snap } = life;
  // Interaction state lives in a ref so pointer handlers always see the latest values.
  const P = useRef({ brush: null, sel: null, selD: null, anchor: null, drag: null, adjust: null, mode: null, bubble: null, focusNew: false }).current;
  const G = useRef({ gut: 22, top: 14, cell: 6, gap: 3 }).current;
  const [, rerender] = useReducer((x) => x + 1, 0);
  const cvRef = useRef(null), gwRef = useRef(null), newRef = useRef(null), drawRef = useRef(null);

  const L = activeLens(state);
  if (P.sel == null) P.sel = nowI;

  const rowY = (r) => G.top + r * G.cell + Math.floor(r / 10) * G.gap;
  const rowAt = (y) => { const n = Math.ceil(spanW / 52); let r = 0; while (r + 1 < n && rowY(r + 1) <= y) r++; return r; };
  const rowAtEnd = (y) => { let r = 0; while (r < 110 && rowY(r) <= y) r++; return r; };

  // The lens as it would look if the current drag were released now.
  const previewLens = () => {
    if (!L || !P.drag || P.brush == null) return L;
    const c = { ...L, spans: L.spans.map((s) => ({ ...s })) };
    const [a, b] = rng(P.drag.a, P.drag.b);
    paint(c, a, b, P.brush === "erase" ? null : P.brush);
    return c;
  };
  const PL = previewLens();

  const draw = () => {
    const wrap = gwRef.current, cv = cvRef.current;
    if (!wrap || !cv) return;
    const W = wrap.clientWidth;
    if (!W) return;
    const gut = 22, top = 14, cell = (W - gut) / 52, gap = Math.max(3, cell * 0.5);
    Object.assign(G, { gut, top, cell, gap });
    const rows = Math.ceil(spanW / 52), H = Math.ceil(rowY(rows - 1) + cell + 2), dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + "px";
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const inkC = cssv("--ink"), faint = cssv("--faint"), empty = cssv("--empty"), accent = cssv("--accent");
    ctx.font = `500 9.5px "Instrument Sans",system-ui,sans-serif`; ctx.fillStyle = faint; ctx.textBaseline = "middle"; ctx.textAlign = "right";
    for (let r = 0; r < rows; r += 5) ctx.fillText(r, gut - 5, rowY(r) + cell / 2);
    const arr = new Array(spanW).fill(null);
    if (PL) for (const s of PL.spans) { const c = catOf(PL, s.cat); for (let i = Math.max(0, s.a); i < eb(s); i++) arr[i] = c; }
    const s = Math.max(2, cell * 0.8), off = (cell - s) / 2, rad = Math.min(3, s * 0.22);
    const box = (i, inset = 0) => [gut + (i % 52) * cell + off - inset, rowY(Math.floor(i / 52)) + off - inset, s + inset * 2];
    const rr = (x, y, w, rd) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, w, rd) : ctx.rect(x, y, w, w); };
    let dr = null;
    if (P.drag && P.brush != null) dr = [Math.min(P.drag.a, P.drag.b), Math.max(P.drag.a, P.drag.b)];
    for (let i = 0; i < spanW; i++) {
      const c = arr[i], past = i <= nowI, hot = dr && i >= dr[0] && i <= dr[1];
      ctx.globalAlpha = hot ? 1 : c ? (past ? 1 : 0.34) : past ? 0.85 : 0.45;
      ctx.fillStyle = c ? c.color : past ? faint : empty;
      const [x, y] = box(i); rr(x, y, s, rad); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = inkC; ctx.lineWidth = Math.max(1.3, cell * 0.14);
    for (const e of state.events) { if (e.w >= spanW) continue; const [x, y, w] = box(e.w, Math.max(2, cell * 0.22)); ctx.beginPath(); ctx.arc(x + w / 2, y + w / 2, w / 2, 0, 7); ctx.stroke(); }
    { const [x, y] = box(nowI); ctx.fillStyle = accent; rr(x, y, s, rad); ctx.fill(); }
    const ring = (i, col) => { const [x, y, w] = box(i, Math.max(1.5, cell * 0.16)); ctx.strokeStyle = col; ctx.lineWidth = 2; rr(x, y, w, rad + 1); ctx.stroke(); };
    if (P.anchor != null) ring(P.anchor, inkC);
    else if (P.brush == null && P.sel != null && P.sel < spanW) ring(P.sel, accent);
    if (P.adjust && PL) { const sp = PL.spans.find((x) => x.id === P.adjust); if (sp) { ring(sp.a, inkC); ring(eb(sp) - 1, inkC); } }
  };
  drawRef.current = draw;
  useLayoutEffect(() => { draw(); });
  useEffect(() => {
    const ro = new ResizeObserver(() => drawRef.current());
    ro.observe(gwRef.current);
    if (document.fonts) document.fonts.ready.then(() => drawRef.current());
    return () => { ro.disconnect(); asStop(); };
  }, []);
  useEffect(() => { if (P.focusNew) { P.focusNew = false; newRef.current?.focus(); } });

  // ---- pointer handling on the grid ----
  const hit = (e) => {
    const r = cvRef.current.getBoundingClientRect();
    return clamp(rowAt(e.clientY - r.top) * 52 + clamp(Math.floor((e.clientX - r.left - G.gut) / G.cell), 0, 51), 0, spanW - 1);
  };
  const bubble = (e) => {
    const r = cvRef.current.getBoundingClientRect(), d = P.drag, n = Math.abs(d.b - d.a) + 1;
    P.bubble = {
      text: `${wLabel(d.b)}${n > 1 ? ` · ${n < 52 ? n + " wks" : yrs(n) + " yrs"}` : ""}`,
      left: clamp(e.clientX - r.left, 80, r.width - 80), top: Math.max(24, e.clientY - r.top - 34),
    };
  };
  const apply = (a, b) => {
    const [lo, hi] = rng(a, b);
    P.anchor = null;
    update((st) => {
      const s = paint(activeLens(st), lo, hi, P.brush === "erase" ? null : P.brush);
      P.adjust = s ? s.id : null;
    });
  };
  const down = (e) => {
    const i = hit(e);
    if (P.brush == null) { P.sel = i; P.selD = null; P.adjust = null; P.mode = null; rerender(); return; }
    e.preventDefault();
    try { cvRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    P.drag = { a: i, b: i, moved: false, x: e.clientX, y: e.clientY }; P.adjust = null;
    bubble(e); rerender();
  };
  const move = (e) => {
    const d = P.drag;
    if (!d) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) d.moved = true;
    d.b = hit(e); bubble(e); rerender();
    autoScroll(e, move);
  };
  const up = () => {
    const d = P.drag;
    if (!d) return;
    asStop(); P.drag = null; P.bubble = null;
    if (d.moved && d.a !== d.b) apply(d.a, d.b);
    else if (P.anchor != null) { const a = P.anchor; apply(a, d.a); }
    else { P.anchor = d.a; rerender(); }
  };
  const cancel = () => { asStop(); P.drag = null; P.bubble = null; rerender(); };

  // ---- hold-to-repeat nudges for the stroke just painted ----
  const nudge = (side, d) => update((st) => {
    const l = activeLens(st), s = l.spans.find((x) => x.id === P.adjust);
    if (s) moveEdge(l, s, side, (side === "a" ? s.a : eb(s)) + d);
  }, { undo: false });
  const nudgeDown = (side, d) => (e) => {
    e.preventDefault();
    snap(); nudge(side, d);
    let n = 0, t;
    const tick = () => { nudge(side, d * (++n > 25 ? 4 : 1)); t = setTimeout(tick, 55); };
    t = setTimeout(tick, 380);
    const stop = () => { clearTimeout(t); window.removeEventListener("pointerup", stop); window.removeEventListener("pointercancel", stop); };
    window.addEventListener("pointerup", stop); window.addEventListener("pointercancel", stop);
  };
  const nudgeKey = (side, d) => (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); snap(); nudge(side, d); } };
  const stepper = (side, d, label) => (
    <button className="st" aria-label={label} onPointerDown={nudgeDown(side, d)} onKeyDown={nudgeKey(side, d)}>{d < 0 ? "◀" : "▶"}</button>
  );

  // ---- actions ----
  const pickLens = (id) => {
    if (L && L.id === id) P.mode = P.mode === "lens" ? null : "lens";
    else { P.mode = null; update((st) => { st.active = id; }, { undo: false }); }
    P.brush = P.adjust = P.anchor = null; rerender();
  };
  const pickBrush = (id) => { P.brush = P.brush === id ? null : id; P.adjust = P.anchor = P.mode = null; rerender(); };
  const done = () => { P.adjust = P.mode = null; rerender(); };
  const addCat = (e) => {
    e.preventDefault();
    const v = new FormData(e.target).get("name").trim();
    if (!v) return;
    P.mode = null;
    update((st) => { const l = activeLens(st); P.brush = (findCat(l, v) || newCat(st, l, v)).id; });
  };
  const addLens = (e) => {
    e.preventDefault();
    const v = new FormData(e.target).get("name").trim();
    if (!v) return;
    P.mode = "newCat"; P.focusNew = true;
    update((st) => { const l = { id: uid(), name: v, cats: [], spans: [] }; st.lenses.push(l); st.active = l.id; });
  };
  const pinEvent = (e) => {
    e.preventDefault();
    const v = new FormData(e.target).get("name").trim();
    if (!v) return;
    e.target.reset();
    update((st) => { const ev = { id: uid(), label: v, w: P.sel }; if (P.selD) ev.d = P.selD; st.events.push(ev); });
  };
  const jumpDate = (e) => {
    const w = dateW(e.target.value);
    if (w == null) return;
    P.sel = w; P.selD = e.target.value;
    if (w >= spanW) update((st) => { st.exp = Math.min(110, ageOf(w) + 1); });
    else rerender();
  };
  const delCat = () => { const id = P.brush; P.brush = null; update((st) => { const l = activeLens(st); l.spans = l.spans.filter((s) => s.cat !== id); l.cats = l.cats.filter((c) => c.id !== id); }); };
  const delLens = () => { P.mode = null; update((st) => { const id = activeLens(st)?.id; st.lenses = st.lenses.filter((l) => l.id !== id); }); };
  const delEvent = (id) => update((st) => { st.events = st.events.filter((e) => e.id !== id); });
  const editCat = (patch) => update((st) => { Object.assign(catOf(activeLens(st), P.brush), patch); }, { undo: false });

  // ---- tray ----
  const tl = PL ? totals(PL) : [];
  const yearsOf = (id) => { const g = tl.find((x) => x.cat && x.cat.id === id); return g ? yrs(g.past + g.future) : "0"; };
  const sp = L && P.adjust && L.spans.find((s) => s.id === P.adjust);
  const bc = L && P.brush && P.brush !== "erase" ? catOf(L, P.brush) : null;
  let ctx;
  if (!L) ctx = null;
  else if (P.mode === "newCat") ctx = (
    <form className="row" onSubmit={addCat}>
      <input className="txt grow" name="name" ref={newRef} placeholder="Name it, like “Roommates”" autoComplete="off" aria-label="New color name" />
      <button className="btn pri">Add color</button>
    </form>
  );
  else if (P.mode === "newLens") ctx = (
    <form className="row" onSubmit={addLens}>
      <input className="txt grow" name="name" ref={newRef} placeholder="Lens name, like “Work” or “Pets”" autoComplete="off" aria-label="New lens name" />
      <button className="btn pri">Add lens</button>
    </form>
  );
  else if (P.mode === "lens") ctx = (
    <>
      <div className="row">
        <input className="txt grow" value={L.name} aria-label="Lens name" onChange={(e) => update((st) => { activeLens(st).name = e.target.value; }, { undo: false })} />
        <button className="btn del" onClick={delLens}>Delete lens</button>
        <button className="btn" onClick={done}>Done</button>
      </div>
      <Breakdown lens={L} />
    </>
  );
  else if (sp) ctx = (
    <>
      <div className="adj num">
        <span>Starts</span>{stepper("a", -1, "Start one week earlier")}<output>{wLabel(sp.a)}</output>{stepper("a", 1, "Start one week later")}
        <span>Ends</span>{stepper("b", -1, "End one week earlier")}<output>{wLabel(eb(sp))}</output>{stepper("b", 1, "End one week later")}
      </div>
      <div className="adj-foot">
        <span><b>{catOf(L, sp.cat).label}</b> · <span className="num">{yrs(eb(sp) - sp.a)} yrs</span> · hold an arrow to move faster</span>
        <button className="btn pri" onClick={done}>Done</button>
      </div>
    </>
  );
  else if (bc) ctx = (
    <>
      <div className="row">
        <input type="color" className="swatch" value={bc.color} aria-label="Color" onChange={(e) => editCat({ color: e.target.value })} />
        <input className="txt grow" value={bc.label} aria-label="Name" onChange={(e) => editCat({ label: e.target.value })} />
        <button className="btn del" onClick={delCat}>Delete</button>
      </div>
      <div className="hint">{P.anchor != null ? <>Started at <b>{wLabel(P.anchor)}</b>. Now tap the last week.</> : "Drag across the grid to paint. Or tap the first week, then the last."}</div>
    </>
  );
  else if (P.brush === "erase") ctx = <div className="hint" style={{ margin: 0 }}>{P.anchor != null ? "Now tap the last week to clear." : "Drag across weeks to clear them."}</div>;
  else {
    const i = Math.min(P.sel ?? nowI, spanW - 1), evs = state.events.filter((e) => e.w === i);
    ctx = (
      <>
        <div className="row">
          <span className="grow">
            <b className="num">{P.selD ? fD.format(parseD(P.selD)) : "Week of " + fD.format(wMs(i))}</b>{i === nowI ? " · this week" : ""}<br />
            <span className="num">You at {ageOf(i)}, week {(i % 52) + 1} of that year</span>
          </span>
          <input type="date" className="txt" style={{ width: "auto", fontSize: 14 }} value={P.selD || isoW(i)} onChange={jumpDate} aria-label="Jump to a date" />
        </div>
        <div className="tags">
          {state.lenses.map((l) => { const s = spanAt(l, i), c = s && catOf(l, s.cat); return <span key={l.id}><i style={{ background: c ? c.color : "var(--empty)" }}></i>{c ? c.label : l.name + ": not set"}</span>; })}
        </div>
        {evs.length > 0 && (
          <div className="evs">{evs.map((e) => <button key={e.id} onClick={() => delEvent(e.id)} aria-label={`Remove ${e.label}`}>◯ {e.label}{bornNote(e)} ×</button>)}</div>
        )}
        <form className="row" onSubmit={pinEvent}>
          <input className="txt grow" name="name" placeholder="What happened this week?" autoComplete="off" aria-label="Event name" />
          <button className="btn">Pin</button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="p-stats num">Week <b>{nf.format(nowI + 1)}</b> of <b>{nf.format(total)}</b> · {Math.round(((nowI + 1) / total) * 100)}% of your estimate</div>
      <div className="chips">
        {state.lenses.map((l) => <button key={l.id} className="chip" aria-pressed={L?.id === l.id} onClick={() => pickLens(l.id)}>{l.name || "Untitled"}</button>)}
        <button className="chip dash" onClick={() => { P.mode = "newLens"; P.brush = P.adjust = null; P.focusNew = true; rerender(); }}>New lens</button>
      </div>
      <div className="gridwrap" ref={gwRef}>
        <canvas ref={cvRef} aria-label="Every week of your life. Pick a color below, then drag to paint."
          style={{ touchAction: P.brush == null ? "manipulation" : "none", cursor: P.brush == null ? "pointer" : "crosshair" }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel}></canvas>
        {P.bubble && <div className="bubble" style={{ left: P.bubble.left, top: P.bubble.top }}>{P.bubble.text}</div>}
      </div>
      <EndHandle life={life} yToYears={(y) => rowAtEnd(y - cvRef.current.getBoundingClientRect().top)} />
      <div className="tray">
        {!L ? (
          <div className="ctx">No lenses yet. A lens is one way to slice your life, like where you lived.{" "}
            <button className="btn pri" onClick={() => update((st) => { const l = { id: uid(), name: "New lens", cats: [], spans: [] }; st.lenses.push(l); st.active = l.id; })}>Add a lens</button>
          </div>
        ) : (
          <>
            <div className="chips">
              {L.cats.map((c) => (
                <button key={c.id} className="chip" data-brush={c.id} aria-pressed={P.brush === c.id} onClick={() => pickBrush(c.id)}>
                  <i style={{ background: c.color }}></i><span>{c.label || "Untitled"}</span><b>{yearsOf(c.id)}</b>
                </button>
              ))}
              <button className="chip" data-brush="erase" aria-pressed={P.brush === "erase"} onClick={() => pickBrush("erase")}>Eraser</button>
              <button className="chip dash" onClick={() => { P.mode = "newCat"; P.adjust = null; P.focusNew = true; rerender(); }}>New color</button>
            </div>
            <div className="ctx">{ctx}</div>
          </>
        )}
      </div>
    </>
  );
}
