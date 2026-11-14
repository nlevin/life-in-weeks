// Pointer-drag helpers shared by the views.

// The element that scrolls the page: the document, or a scrolling wrapper around the app.
export function scrollerOf(el) {
  for (let n = el?.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    const o = getComputedStyle(n).overflowY;
    if (o === "auto" || o === "scroll") return n;
  }
  return document.scrollingElement || document.documentElement;
}
let asRaf = null, asEv = null, asFn = null;

// While a drag is held near the top or bottom edge, scroll the page and keep the drag going.
export function autoScroll(e, fn) {
  asEv = e; asFn = fn;
  if (!asRaf) asRaf = requestAnimationFrame(asTick);
}
function asTick() {
  asRaf = null;
  if (!asEv) return;
  const y = asEv.clientY, top = 48 + 44, tr = document.querySelector(".tray");
  const bot = (tr ? Math.min(innerHeight, tr.getBoundingClientRect().top) : innerHeight) - 28;
  const d = y < top ? -Math.min(16, (top - y) / 3 + 3) : y > bot ? Math.min(16, (y - bot) / 3 + 3) : 0;
  if (!d) return;
  const sc = scrollerOf(tr || document.getElementById("view")), before = sc.scrollTop;
  sc.scrollBy(0, d);
  if (sc.scrollTop !== before) asFn(asEv);
  asRaf = requestAnimationFrame(asTick);
}
export function asStop() {
  asEv = null;
  cancelAnimationFrame(asRaf);
  asRaf = null;
}

// Follow a drag on the window, so it survives re-renders of the element it started on.
export function dragWin(move, up) {
  document.body.style.userSelect = document.body.style.webkitUserSelect = "none";
  const mv = (e) => { e.preventDefault(); move(e); autoScroll(e, move); };
  const end = (e) => {
    asStop();
    document.body.style.userSelect = document.body.style.webkitUserSelect = "";
    try { getSelection().removeAllRanges(); } catch (err) {}
    window.removeEventListener("pointermove", mv);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    up(e);
  };
  window.addEventListener("pointermove", mv, { passive: false });
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function showTag(x, y, text) {
  const tag = document.getElementById("dragtag");
  if (!tag) return;
  tag.hidden = false;
  tag.textContent = text;
  tag.style.left = clamp(x, 90, innerWidth - 90) + "px";
  tag.style.top = y + "px";
}
export function hideTag() {
  const tag = document.getElementById("dragtag");
  if (tag) tag.hidden = true;
}
