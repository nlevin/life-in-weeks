// Mounts Graphical's editor around the app in development only.
// This file has no Graphical imports: production builds drop the dynamic import below.
import { useEffect, useState } from 'react';

const loadDevelopmentEditor = import.meta.env.DEV
  ? () => import('./development-editor.jsx')
  : null;

export default function EditorRoot(props) {
  const [Editor, setEditor] = useState(null);
  useEffect(() => {
    if (!loadDevelopmentEditor) return;
    let active = true;
    void loadDevelopmentEditor().then(
      ({ default: editor }) => { if (active) setEditor(() => editor); },
      (error) => { if (active) console.error('Graphical shell unavailable; app retained.', error); },
    );
    return () => { active = false; };
  }, []);
  return Editor ? <Editor {...props} /> : props.children;
}
