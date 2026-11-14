import { useCallback, useMemo, useReducer, useRef } from "react";
import { derive, load, sample, save } from "./model.js";

// One shared life, edited by all three views. Mutations run on a clone, so
// React always sees a new object, and every committed edit can be undone.
export function useLife() {
  const ref = useRef(null);
  if (!ref.current) ref.current = { state: load() || sample(), undo: [] };
  const [, rerender] = useReducer((x) => x + 1, 0);

  const snap = useCallback(() => {
    const r = ref.current;
    r.undo.push(JSON.stringify(r.state));
    if (r.undo.length > 80) r.undo.shift();
  }, []);
  const unsnap = useCallback(() => { ref.current.undo.pop(); rerender(); }, []);
  const update = useCallback((fn, opts = {}) => {
    const r = ref.current;
    if (opts.undo !== false) snap();
    const next = structuredClone(r.state);
    derive(next);
    fn(next);
    derive(next);
    r.state = next;
    save(next);
    rerender();
  }, [snap]);
  const undo = useCallback(() => {
    const r = ref.current;
    if (!r.undo.length) return;
    r.state = JSON.parse(r.undo.pop());
    derive(r.state);
    save(r.state);
    rerender();
  }, []);
  const getState = useCallback(() => ref.current.state, []);

  const state = ref.current.state;
  derive(state);
  const canUndo = ref.current.undo.length > 0;
  return useMemo(
    () => ({ state, update, snap, unsnap, undo, getState, canUndo }),
    [state, canUndo, update, snap, unsnap, undo, getState]
  );
}
