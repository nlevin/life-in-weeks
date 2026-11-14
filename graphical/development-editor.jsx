// Loaded only in development. Keeps the editor's imports, CSS and project
// validation inside a guarded asynchronous import, so a failure leaves the app running.
import { GraphicalEditorLoader } from '@graphical/editor/loader';

const loadEditor = async () => ({
  GraphicalInstalledEditor: (await import('./installed-editor.jsx')).default,
});

export default function DevelopmentEditor(props) {
  return <GraphicalEditorLoader loadEditor={loadEditor} {...props} />;
}
