// Shared life model: dates, spans, events, and the plain-language parser.
const DAY = 864e5, WEEK = 7 * DAY, BIG = 99999;
const PAL = ["#D9805F","#4F6D8F","#7FA88B","#E2B85C","#9A7CB8","#5FA3B8","#C76B8A","#8C8A5A","#B5654A","#6E8FD1","#4E9A7A","#C9A227"];
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const KEY = "lifeweeks.proto.v2";
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nf = new Intl.NumberFormat("en-US");
const fMY = new Intl.DateTimeFormat("en-US", {month:"short", year:"numeric", timeZone:"UTC"});
const fD = new Intl.DateTimeFormat("en-US", {month:"short", day:"numeric", year:"numeric", timeZone:"UTC"});
function parseD(s){ if(!s) return null; const [y,m,d] = s.split("-").map(Number); return y && m && d ? Date.UTC(y, m-1, d) : null; }
function todayMs(){ const n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); }
let B, total, nowI, spanW;
function bday(n){ const d = new Date(B); return Date.UTC(d.getUTCFullYear()+n, d.getUTCMonth(), d.getUTCDate()); }
function weekIdx(ms){ if(ms <= B) return 0; let a = new Date(ms).getUTCFullYear() - new Date(B).getUTCFullYear(); if(bday(a) > ms) a--; return a*52 + Math.min(51, Math.floor((ms - bday(a))/WEEK)); }
function wMs(w){ return bday(Math.floor(w/52)) + (w%52)*WEEK; }
const ageOf = w => Math.floor(w/52);
const yrs = w => (w/52).toFixed(1);
const yearOf = w => new Date(wMs(w)).getUTCFullYear();
// weeks are counted from your birthday, so a week can straddle two months: name it by the month it ends in, which keeps "Sep 2025" reading as Sep 2025
const wEnd = w => wMs(w) + 6*DAY;
function wLabel(w){ return w <= 0 ? "Your birth" : w >= spanW ? "The end" : `${fMY.format(wEnd(w))} · you at ${ageOf(w)}`; }
const evMs = e => (e.d && parseD(e.d)) || wEnd(e.w);
const evLabel = e => `${e.d ? fD.format(parseD(e.d)) : fMY.format(wEnd(e.w))} · you at ${ageOf(e.w)}`;
const isoW = w => new Date(wMs(w)).toISOString().slice(0, 10);
// an event like "Gemma born" is someone else's birth: show how old they are now
function bornNote(e){ if(!/\bborn\b|\bbirth of\b/i.test(e.label) || e.w > nowI || e.w <= 0) return ""; const n = nowI - e.w; return n < 52 ? ` · now ${Math.max(1, Math.round(n/4.345))} mo old` : ` · now ${Math.floor(n/52)} yr old`; }
function ink(hex){ const n = parseInt(hex.slice(1), 16), r = n>>16, g = n>>8&255, b = n&255; return (r*299 + g*587 + b*114)/1000 > 150 ? "#1E1B16" : "#fff"; }

function sample(birth = "1990-06-15"){
  const c = (label, i) => ({id:uid(), label, color:PAL[i]});
  const mk = (name, cats, spans) => { const L = {id:uid(), name, cats:cats.map(([l,i]) => c(l,i)), spans:[]}; L.spans = spans.map(([k,a,b]) => ({id:uid(), cat:L.cats[k].id, a:a*52, b:b >= 999 ? BIG : b*52})); return L; };
  const lenses = [
    mk("Chapters", [["Early years",3],["School",2],["College",1],["Career",0],["Retirement",4]], [[0,0,5],[1,5,18],[2,18,22],[3,22,65],[4,65,999]]),
    mk("Living with", [["Parents",5],["On my own",7],["Partner",6],["Partner and kid",11]], [[0,0,18],[1,18,26],[2,26,33],[3,33,51],[2,51,999]]),
    mk("Places", [["Hometown",8],["College town",9],["San Francisco",10]], [[0,0,18],[1,18,22],[2,22,999]])
  ];
  return {birth, exp:80, lenses, active:lenses[1].id, events:[{id:uid(), label:"Graduated", w:22*52-2},{id:uid(), label:"Married", w:28*52+10},{id:uid(), label:"Kid born", w:33*52+38}]};
}
function load(){ try { const s = JSON.parse(localStorage.getItem(KEY)); return s && Array.isArray(s.lenses) ? s : null; } catch(e){ return null; } }

function save(state){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
// The derived numbers every view reads. Call derive(state) before reading them.
function derive(state){
  B = parseD(state.birth); total = Math.round(state.exp*52); nowI = weekIdx(todayMs()); spanW = Math.max(total, nowI + 1);
}
const lensBy = (st, id) => st.lenses.find(l => l.id === id);
const activeLens = st => lensBy(st, st.active) || st.lenses[0] || null;
function findSpan(st, id){ for(const L of st.lenses){ const s = L.spans.find(x => x.id === id); if(s) return [L, s]; } return []; }
function dateW(value){ const ms = parseD(value); if(!ms || ms < B) return null; return weekIdx(ms); }
const rng = (a, b) => { const lo = Math.min(a, b), hi = Math.max(a, b); return [lo, hi >= spanW - 1 ? BIG : hi + 1]; };
const catOf = (L, id) => L.cats.find(c => c.id === id);
const spanAt = (L, w) => L.spans.find(s => s.a <= w && w < s.b);
const eb = s => Math.min(s.b, spanW);
function newCat(st, L, label){ const c = {id:uid(), label, color:PAL[(L.cats.length + st.lenses.indexOf(L)*3) % PAL.length]}; L.cats.push(c); return c; }
function findCat(L, label){ const k = label.trim().toLowerCase(); return L.cats.find(c => c.label.trim().toLowerCase() === k); }
function paint(L, a, b, cat){
  if(b <= a) return null;
  const out = [];
  for(const s of L.spans){
    if(s.b <= a || s.a >= b){ out.push(s); continue; }
    if(s.a < a) out.push({...s, id:uid(), b:a});
    if(s.b > b) out.push({...s, id:uid(), a:b});
  }
  let ns = null; if(cat){ ns = {id:uid(), cat, a, b}; out.push(ns); }
  out.sort((x, y) => x.a - y.a);
  const m = [];
  for(const s of out){ const p = m[m.length-1]; if(p && p.cat === s.cat && p.b >= s.a){ p.b = Math.max(p.b, s.b); if(s === ns) ns = p; } else m.push(s); }
  L.spans = m; return ns;
}
function moveEdge(L, s, side, w){
  const i = L.spans.indexOf(s), prev = L.spans[i-1], next = L.spans[i+1];
  if(side === "a"){
    w = clamp(w, prev ? prev.a + 1 : 0, eb(s) - 1);
    if(prev && (prev.b === s.a || w < prev.b)) prev.b = w;
    s.a = w;
  } else {
    w = clamp(w, s.a + 1, next ? eb(next) - 1 : spanW);
    if(!next && w >= spanW){ s.b = BIG; return; }
    if(next && (next.a === s.b || w > next.a)) next.a = w;
    s.b = w;
  }
}
function totals(L){
  const m = new Map(); let cov = 0, cp = 0;
  for(const s of L.spans){
    const a = Math.min(s.a, spanW), b = eb(s); if(b <= a) continue;
    const past = clamp(nowI + 1 - a, 0, b - a);
    const g = m.get(s.cat) || {cat:catOf(L, s.cat), past:0, future:0};
    g.past += past; g.future += b - a - past; m.set(s.cat, g); cov += b - a; cp += past;
  }
  const out = [...m.values()].filter(g => g.cat);
  if(spanW - cov > 0) out.push({cat:null, past:nowI + 1 - cp, future:spanW - cov - (nowI + 1 - cp)});
  return out;
}
function brkHTML(L){
  return `<div class="brk num">${totals(L).map(g => `<i style="background:${g.cat ? esc(g.cat.color) : "var(--empty)"}"></i><span>${esc(g.cat ? g.cat.label : "Not set")}</span><b>${yrs(g.past + g.future)} yrs</b><em style="font-style:normal">${Math.round((g.past + g.future)/spanW*100)}%</em>`).join("")}</div>`;
}


// ---- plain-language input ----
const EXAMPLES = ["Lived with parents until 18", "College 2008 to 2012", "Moved to Lisbon in 2031", "Married June 2018", "Kid born 9/14/2025", "Retire at 60", "How long with parents vs partner?", "What was I doing at 25?"];
function wOf(y, mo, d){ return weekIdx(Date.UTC(y, mo, d)); }
function tokens(low){
  const toks = [], used = []; let m, re;
  const add = (i, len, o) => { if(len <= 0 || used.some(u => i < u[1] && i + len > u[0])) return; used.push([i, i + len]); toks.push({i, len, ...o}); };
  re = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(?:(\d{1,2})(?:st|nd|rd|th)?,?\s+)?((?:19|20|21)\d\d)\b/g; while((m = re.exec(low))) add(m.index, m[0].length, {y:+m[3], mo:MONTHS.indexOf(m[1]), d:m[2] ? clamp(+m[2], 1, 28) : 0});
  re = /\b(\d{1,2})\/(\d{1,2})\/((?:19|20|21)\d\d)\b/g; while((m = re.exec(low))) add(m.index, m[0].length, {y:+m[3], mo:clamp(+m[1] - 1, 0, 11), d:clamp(+m[2], 1, 28)});
  re = /\b(\d{1,2})\/((?:19|20|21)\d\d)\b/g; while((m = re.exec(low))) add(m.index, m[0].length, {y:+m[2], mo:clamp(+m[1] - 1, 0, 11)});
  re = /\b(?:19|20|21)\d\d\b/g; while((m = re.exec(low))) add(m.index, m[0].length, {y:+m[0]});
  re = /\b(?:age|aged|at|turn(?:ed|ing|s)?|when i was|i was)\s+(\d{1,3})\b|\b(\d{1,3})\s*(?:years old|yo)\b/g; while((m = re.exec(low))){ const a = +(m[1] || m[2]); if(a <= 120) add(m.index, m[0].length, {age:a}); }
  re = /\b(\d{1,3})\s*(?:-|to)\s*(\d{1,3})\b/g; while((m = re.exec(low))){ if(+m[1] > 120 || +m[2] > 120) continue; add(m.index, m[1].length, {age:+m[1]}); add(m.index + m[0].length - m[2].length, m[2].length, {age:+m[2]}); }
  re = /\b(?:until|till|til|to|from|since|through|after|before)\s+(\d{1,3})\b/g; while((m = re.exec(low))){ if(+m[1] <= 120) add(m.index + m[0].length - m[1].length, m[1].length, {age:+m[1]}); }
  re = /\b(?:now|today|present|currently)\b/g; while((m = re.exec(low))) add(m.index, m[0].length, {now:true});
  re = /\b(?:from|since)\s+(?:my\s+)?(?:birth|born)\b|\b(?:birth|born)(?=\s*(?:to|until|till|-)\s)/g; while((m = re.exec(low))) add(m.index, m[0].length, {w:0});
  re = /\b(?:the end|death|forever|rest of my life|onwards?)\b/g; while((m = re.exec(low))) add(m.index, m[0].length, {end:true});
  return toks.sort((a, b) => a.i - b.i);
}
function tokW(t, role){
  if(t.w != null) return t.w; if(t.now) return role === "end" ? nowI + 1 : nowI; if(t.end) return BIG; if(t.age != null) return t.age*52;
  if(t.mo != null) return wOf(t.y, t.mo, t.d || 1);
  if(role === "event"){ const w = wOf(t.y, 6, 1); return w > nowI && t.y === new Date().getFullYear() ? nowI : w; }
  return wOf(t.y, 0, 1);
}
function parse(st, text, force){
  const raw = text.trim(); if(!raw) return {type:"empty"};
  const low = raw.toLowerCase().replace(/[–—]/g, "-");
  let m = low.match(/\b(?:live to|living to|expect(?:ancy)?|estimate)\D{0,20}(\d{2,3})\b/);
  if(m) return {type:"exp", v:clamp(+m[1], Math.max(40, ageOf(nowI) + 1), 110)};
  if(/\?\s*$/.test(low) || /^(how|what|when|who|where|compare)\b/.test(low)) return {type:"ask", text:raw};
  const toks = tokens(low);
  if(!toks.length) return {type:"none", why:"Add when it happened: a year, a month and year, or an age. Like “2014”, “June 2018” or “at 18”."};
  let s = raw.replace(/[–—]/g, "-"); for(const t of [...toks].reverse()) s = s.slice(0, t.i) + "\u0001" + s.slice(t.i + t.len);
  for(let k = 0; k < 3; k++) s = s.replace(/(?:\b(?:from|to|until|till|til|since|in|at|on|age|aged|through|starting|after|before|during|around)\b|[-,])\s*(?=\u0001)/gi, "");
  s = s.replace(/\u0001/g, " ").replace(/\s+/g, " ").replace(/^[\s,.\-:]+|[\s,.\-:!]+$/g, "");
  for(let k = 0; k < 2; k++) s = s.replace(/^(?:i|we|i'm|i am|then|and)\s+/i, "").replace(/\s+(?:from|to|until|till|since|in|at|on|and|-)$/i, "");
  let label = s, hint = null, onward = false;
  if((m = label.match(/^(?:(?:lived|living|live|stayed|was|been)\s+)?with\s+(?:my\s+)?(.+)$/i))){ label = m[1]; hint = "living with"; }
  else if((m = label.match(/^(?:moved|moving|move|relocated)\s+to\s+(.+)$/i) || label.match(/^(?:lived|living|live)\s+in\s+(.+)$/i))){ label = m[1]; hint = "places"; onward = true; }
  else if(/^retire(?:d|ment)?$/i.test(label)){ label = "Retirement"; hint = "chapters"; onward = true; }
  if(!label) return {type:"none", why:"Give it a name too, like “College 2008 to 2012”."};
  label = label[0].toUpperCase() + label.slice(1);
  const since = /\b(since|from|starting|after|onwards?)\b/.test(low), until = /\b(until|till|til|through|before)\b/.test(low);
  const isSpan = force ? force !== "event" : toks.length >= 2 || since || until || onward;
  if(!isSpan){ const t0 = toks[0]; if(t0.y && Date.UTC(t0.y, t0.mo ?? 11, 28) < B) return {type:"none", why:`That's before your birthday (${fD.format(B)}). Check the year, or change your birthday at the bottom of the page.`}; return {type:"event", label, w:clamp(tokW(t0, "event"), 0, BIG - 1), d:t0.mo != null && t0.y ? new Date(Math.max(B, Date.UTC(t0.y, t0.mo, t0.d || 1))).toISOString().slice(0, 10) : null, exact:!!t0.d}; }
  const L = (force && lensBy(st, force)) || (hint && st.lenses.find(l => l.name.toLowerCase() === hint)) || st.lenses.find(l => findCat(l, label)) || st.lenses[0];
  if(!L) return {type:"none", why:"Add a lens first so there is somewhere to put this."};
  let a, b, trim = null;
  if(toks.length >= 2){
    a = tokW(toks[0], "start"); b = tokW(toks[1], "end");
    if(toks[0].y && toks[0].y === toks[1].y && toks[0].mo == null && toks[1].mo == null) b = wOf(toks[0].y + 1, 0, 1);
    if(b < a) [a, b] = [b, a]; if(b === a) b = a + 1;
  } else if(until && !since){
    b = tokW(toks[0], "end"); const cov = L.spans.find(x => x.a < b && b < x.b);
    a = cov ? cov.a : Math.max(0, ...L.spans.filter(x => x.b <= b).map(x => x.b));
    if(cov && findCat(L, label)?.id === cov.cat) trim = [b, cov.b];
    if(a >= b) a = 0;
  } else {
    a = tokW(toks[0], "start"); const same = findCat(L, label)?.id, nx = L.spans.filter(x => x.a > a && x.cat !== same).map(x => x.a); b = nx.length ? Math.min(...nx) : BIG;
  }
  return {type:"span", lens:L.id, label, a, b, trim};
}
function describe(st, p){
  if(p.type === "event") return `<i style="border:1.5px solid var(--ink);border-radius:50%"></i>Event: <b>${esc(p.label)}</b> · ${p.exact ? evLabel(p) : wLabel(p.w)}${bornNote(p)}`;
  const L = lensBy(st, p.lens), c = findCat(L, p.label);
  return `<i style="background:${c ? esc(c.color) : "var(--faint)"}"></i>${esc(L.name)}: <b>${esc(p.label)}</b> · ${wLabel(p.a)} → ${p.b >= spanW ? "the end" : wLabel(p.b)} · ${yrs(Math.min(p.b, spanW) - Math.min(p.a, spanW))} yrs`;
}
function answer(st, text){
  const low = text.toLowerCase(), toks = tokens(low.replace(/[–—]/g, "-"));
  if(toks.length){
    const w = clamp(tokW(toks[0], "event"), 0, spanW - 1);
    const bits = st.lenses.map(L => { const s = spanAt(L, w), c = s && catOf(L, s.cat); return c ? `<i style="background:${esc(c.color)}"></i><b>${esc(c.label)}</b> <span style="color:var(--muted);font-size:14px">(${esc(L.name)})</span>` : ""; }).filter(Boolean);
    const ev = st.events.filter(e => ageOf(e.w) === ageOf(w)).map(e => `<b>${esc(e.label)}</b>`);
    return `<p>${w > nowI ? "At" : "At"} age ${ageOf(w)}, in ${yearOf(w)}:</p>${bits.map(b => `<p>${b}</p>`).join("") || "<p>Nothing recorded yet.</p>"}${ev.length ? `<p>That year: ${ev.join(", ")}.</p>` : ""}`;
  }
  const hits = [];
  for(const L of st.lenses){ const t = totals(L); for(const c of [...L.cats].sort((a, b) => b.label.length - a.label.length)){ const k = c.label.trim().toLowerCase(); if(k.length > 1 && new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(low)){ const g = t.find(x => x.cat === c) || {past:0, future:0}; hits.push({L, c, ...g, n:g.past + g.future}); } } }
  const seen = new Set(), uniq = hits.filter(h => { const k = h.c.label.toLowerCase(); if(seen.has(k) || hits.some(o => o !== h && o.c.label.toLowerCase().includes(k) && o.c.label.length > h.c.label.length && low.includes(o.c.label.toLowerCase()) && !new RegExp(`${k}(?!\\s+and)`).test(low.replace(o.c.label.toLowerCase(), "")))) return false; seen.add(k); return true; });
  if(uniq.length){
    let out = uniq.map(h => `<p><i style="background:${esc(h.c.color)}"></i><b>${esc(h.c.label)}</b>: ${yrs(h.n)} years, ${Math.round(h.n/spanW*100)}% of your life. ${h.future === 0 ? "All of it is behind you." : h.past === 0 ? "All of it is still ahead." : `${yrs(h.past)} lived, ${yrs(h.future)} ahead.`}</p>`).join("");
    if(uniq.length === 2 && uniq[0].n && uniq[1].n){ const [x, y] = uniq[0].n >= uniq[1].n ? uniq : [uniq[1], uniq[0]]; out += `<p style="color:var(--muted);font-size:16px">${esc(x.c.label)} is ${(x.n/y.n).toFixed(1)}× as long as ${esc(y.c.label.toLowerCase())}.</p>`; }
    return out;
  }
  const L = st.lenses.find(l => l.name && low.includes(l.name.toLowerCase()));
  if(L) return `<p>${esc(L.name)}, across ${yrs(spanW)} years:</p>${brkHTML(L)}`;
  const names = st.lenses.flatMap(l => l.cats.map(c => c.label)).slice(0, 6).join(", ");
  return `<p style="font-size:16px">I can answer about names you've used (${esc(names)}) or about an age or year. Try “How long with parents?” or “What was I doing at 25?”</p>`;
}

const sFmt = w => w <= 0 ? "birth" : fMY.format(wEnd(w));

export { DAY, WEEK, BIG, PAL, EXAMPLES, uid, clamp, esc, nf, fMY, fD, parseD, todayMs, B, total, nowI, spanW, weekIdx, wMs, ageOf, yrs, yearOf, wEnd, wLabel, evMs, evLabel, isoW, bornNote, ink, sample, load, save, derive, lensBy, activeLens, findSpan, dateW, rng, catOf, spanAt, eb, newCat, findCat, paint, moveEdge, totals, brkHTML, tokens, tokW, parse, describe, answer, sFmt };
