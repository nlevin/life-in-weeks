// Graphical's development editor, wired to this app's project files.
// Loaded only in development, through development-editor.jsx.
import { GraphicalInstalledEditor, readGraphicalProject } from '@graphical/editor/native';
import '@graphical/editor/styles.css';
import project from './project.json';
import theme from './themes/graphical.json';
import roleMap from './role-map.json';

const current = readGraphicalProject(
  project,
  { 'themes/graphical.json': theme }, // Add each project theme's JSON here.
  roleMap,
);

export default function InstalledEditor({ children, route, navigationRoute }) {
  return (
    <GraphicalInstalledEditor
      document={current.document}
      roleMap={current.roleMap}
      handoffContext={current.handoffContext}
      route={route}
      navigationRoute={navigationRoute}
      adoptSkillPath=".agents/skills/graphical-adopt/SKILL.md"
      initialPanelOpen
    >
      {children}
    </GraphicalInstalledEditor>
  );
}
