import { useEffect, useReducer, useRef, useState } from "react";
import {
  EXAMPLES, ageOf, answer, bornNote, catOf, clamp, describe, eb, evMs, fD, fMY, findCat, findSpan, lensBy, newCat, nf, nowI,
  paint, parse, parseD, sFmt, spanAt, spanW, total, uid, yearOf, yrs,
} from "../model.js";

// 3 · Tell: one input line adds, edits and answers.
export default function Tell({ life }) {
  const { state, update } = life;
  const S = useRef({ force: null, edit: null, flash: null, scrollAns: false }).current;
  const [, rerender] = useReducer((x) => x + 1, 0);
  const [text, setText] = useState("");
  const [ans, setAns] = useState(null);
  const inRef = useRef(null), ansRef = useRef(null);

  const p = parse(state, text, S.force);

  useEffect(() => {
    if (S.flash) {
      document.querySelector(".srow.flash .what")?.scrollIntoView({ block: "center", behavior: "smooth" });
      S.flash = null;
    }
    if (S.scrollAns) { S.scrollAns = false; ansRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }); }
  });

  const clearInput = () => { setText(""); S.edit = S.force = null; };
  const submit = (e) => {
    e.preventDefault();
    if (p.type === "empty" || p.type === "none") { inRef.current.focus(); return; }
    if (p.type === "ask") { setAns({ q: p.text, html: answer(state, p.text) }); S.scrollAns = true; clearInput(); return; }
    const edit = S.edit;
    update((st) => {
      if (p.type === "exp") { st.exp = p.v; return; }
      if (edit) {
        const [L, s] = findSpan(st, edit);
        if (s) L.spans = L.spans.filter((x) => x !== s);
        else st.events = st.events.filter((x) => x.id !== edit);
      }
      if (p.type === "event") {
        const ev = { id: uid(), label: p.label, w: p.w };
        if (p.exact) ev.d = p.d;
        st.events.push(ev); S.flash = ev.id;
      } else {
        const L = lensBy(st, p.lens), c = findCat(L, p.label) || newCat(st, L, p.label);
        if (p.trim) paint(L, p.trim[0], p.trim[1], null);
        const s = paint(L, p.a, p.b, c.id);
        S.flash = s?.id;
      }
    });
    clearInput();
  };
  const edit = (id) => {
    const [L, s] = findSpan(state, id);
    S.edit = id;
    if (s) {
      const c = catOf(L, s.cat);
      setText(s.b >= spanW ? `${c.label} since ${sFmt(s.a)}` : s.a <= 0 ? `${c.label} from birth to ${sFmt(s.b)}` : `${c.label} ${sFmt(s.a)} to ${sFmt(s.b)}`);
      S.force = L.id;
    } else {
      const e = state.events.find((x) => x.id === id);
      setText(`${e.label} ${e.d ? fD.format(parseD(e.d)) : sFmt(e.w)}`);
      S.force = "event";
    }
    inRef.current.focus();
  };
  const del = (id) => {
    if (S.edit === id) S.edit = null;
    update((st) => {
      const [L, s] = findSpan(st, id);
      if (s) L.spans = L.spans.filter((x) => x !== s);
      else st.events = st.events.filter((x) => x.id !== id);
    });
  };
  const setExp = (d) => update((st) => { st.exp = clamp(st.exp + d, Math.max(40, ageOf(nowI) + 1), 110); });

  // ---- the story: every span and event in order ----
  const rows = [];
  for (const L of state.lenses) for (const s of L.spans) rows.push({ k: s.a, id: s.id, lens: L, s, c: catOf(L, s.cat) });
  for (const e of state.events) rows.push({ k: e.w + 0.5, id: e.id, e });
  rows.sort((a, b) => a.k - b.k);

  // ---- preview of what the typed line will do ----
  let prev;
  if (p.type === "empty") prev = (
    <div className="chips">
      {EXAMPLES.map((x) => <button key={x} className="chip" onClick={() => { S.force = S.edit = null; setText(x); inRef.current.focus(); }}>{x}</button>)}
    </div>
  );
  else if (p.type === "none") prev = p.why;
  else if (p.type === "ask") prev = "Press Enter to ask.";
  else if (p.type === "exp") prev = <div className="p1">Set your life expectancy to <b>{p.v}</b> years</div>;
  else {
    const kind = p.type === "event" ? "event" : p.lens;
    const pick = (id) => { S.force = id; rerender(); inRef.current.focus(); };
    prev = (
      <>
        <div className="p1" dangerouslySetInnerHTML={{ __html: (S.edit ? "Replace with → " : "") + describe(state, p) }} />
        <div className="chips">
          <button className="chip" aria-pressed={kind === "event"} onClick={() => pick("event")}>Event</button>
          {state.lenses.map((L) => <button key={L.id} className="chip" aria-pressed={kind === L.id} onClick={() => pick(L.id)}>{L.name}</button>)}
        </div>
      </>
    );
  }

  return (
    <>
      <p className="prose">
        You're <b className="num">{ageOf(nowI)}</b>. You expect to live to{" "}
        <span className="stp">
          <button onClick={() => setExp(-1)} aria-label="One year less">−</button>
          <b className="num">&nbsp;{state.exp}&nbsp;</b>
          <button onClick={() => setExp(1)} aria-label="One year more">+</button>
        </span><span>.</span>{" "}
        That's <b className="num">{nf.format(nowI + 1)}</b> weeks behind you and <b className="num">{nf.format(Math.max(0, total - nowI - 1))}</b> ahead.
      </p>

      <div>
        {state.lenses.map((L) => {
          const segs = [];
          let at = 0;
          for (const s of L.spans) { const a = Math.min(s.a, spanW), b = eb(s); if (b <= a) continue; if (a > at) segs.push([at, a, null]); segs.push([a, b, catOf(L, s.cat)]); at = b; }
          if (at < spanW) segs.push([at, spanW, null]);
          const parts = [];
          for (const [a, b, c] of segs) { const cut = clamp(nowI + 1, a, b); if (cut > a) parts.push([a, cut, c, false]); if (b > cut) parts.push([cut, b, c, true]); }
          const cs = spanAt(L, nowI), cc = cs && catOf(L, cs.cat);
          return (
            <div className="ribbon" key={L.id}>
              <div className="lbl"><span>{L.name}</span><span>{cc ? "Now: " + cc.label : ""}</span></div>
              <div className="rb">
                {parts.map(([a, b, c, fut]) => c
                  ? <button key={a} className={fut ? "fut" : ""} style={{ flex: b - a, background: c.color }} aria-label={c.label} onClick={() => setAns({ q: `How long: ${c.label}?`, html: answer(state, c.label) })}></button>
                  : <button key={a} className={fut ? "fut" : ""} style={{ flex: b - a, background: "transparent" }} tabIndex={-1} aria-hidden="true"></button>)}
                <div className="nl" style={{ left: `${((nowI + 1) / spanW) * 100}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      <div ref={ansRef}>
        {ans && (
          <div className="ans" role="status">
            <div className="q"><span>{ans.q}</span><button onClick={() => setAns(null)} aria-label="Dismiss answer">×</button></div>
            <div dangerouslySetInnerHTML={{ __html: ans.html }} />
          </div>
        )}
      </div>

      <h2>Your story</h2>
      <div className="story">
        {rows.length === 0 && <p style={{ gridColumn: "1/-1", color: "var(--muted)" }}>Nothing here yet. Start with where you grew up: “Lived in Portland until 18”.</p>}
        {rows.map((r) => r.e ? (
          <div key={r.id} className={`srow${S.flash === r.id ? " flash" : ""}`}>
            <span className="when">{fMY.format(evMs(r.e))}</span>
            <button className="what" onClick={() => edit(r.id)}><i className="ring"></i>{r.e.label}<small>you at {ageOf(r.e.w)}{bornNote(r.e)}</small></button>
            <span className="len"></span>
            <button className="x" onClick={() => del(r.id)} aria-label={`Delete ${r.e.label}`}>×</button>
          </div>
        ) : (
          <div key={r.id} className={`srow${S.flash === r.id ? " flash" : ""}`}>
            <span className="when">{yearOf(r.s.a)}–{r.s.b >= spanW ? "" : yearOf(r.s.b)}</span>
            <button className="what" onClick={() => edit(r.id)}><i style={{ background: r.c.color }}></i>{r.c.label}<small>{r.lens.name}</small></button>
            <span className="len">{yrs(eb(r.s) - Math.min(r.s.a, spanW))} yrs</span>
            <button className="x" onClick={() => del(r.id)} aria-label={`Delete ${r.c.label}`}>×</button>
          </div>
        ))}
      </div>

      <div className="tray composer">
        <div className="prev" id="sPrev">{prev}</div>
        <form onSubmit={submit}>
          <input className="txt" id="sIn" ref={inRef} value={text} placeholder="Tell me something, or ask" autoComplete="off" autoCapitalize="sentences" enterKeyHint="send"
            aria-label="Tell me something about your life, or ask a question"
            onChange={(e) => { if (!S.edit) S.force = null; setText(e.target.value); }} />
          <button className="btn pri" id="sGo">{p.type === "ask" ? "Ask" : S.edit ? "Save" : p.type === "exp" ? "Set" : "Add"}</button>
        </form>
      </div>
    </>
  );
}
