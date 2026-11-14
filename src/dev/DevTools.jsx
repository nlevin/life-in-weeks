// Development-only tools beside Graphical's editor: the palette explorer and
// Agentation (annotate the UI and copy the feedback for an agent).
import { useState } from "react";
import { Agentation } from "agentation";
import PaletteExplorer from "./PaletteExplorer.jsx";

export default function DevTools() {
  // Render Agentation inside the app, so with the editor open it stays in the app's area.
  const [host, setHost] = useState(null);
  return (
    <>
      <PaletteExplorer />
      <div ref={setHost} className="dev-agentation-host" />
      {host && <Agentation portalContainer={host} className="dev-agentation" appName="A life in weeks" useHashLocation />}
    </>
  );
}
