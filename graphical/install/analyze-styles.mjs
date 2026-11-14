// Style analysis for the Graphical import. Run from the app root:
//   node graphical/install/analyze-styles.mjs
import { analyzeAppStyles } from '@graphical/editor/analyze-styles';
import { writeFile } from 'node:fs/promises';

const inventory = await analyzeAppStyles({
  root: process.cwd(),
  roots: ['src'],
  appName: 'A life in weeks',
  variables: {},
  classify({ family, path, text, property, value }) {
    // The model holds the category palette as references to the theme's color slots
    // (var(--color-3) … var(--color-10)) and a fallback label ink; nothing here to convert.
    if (path.endsWith('src/model.js')) return { preserve: true };
    // The dev-only Palettes button copies Graphical's own GUI button (fixed dark chrome, not the app theme).
    if (path.endsWith('src/dev/palette-explorer.css') && (family === 'color' || family === 'shadow') && /^#|rgba?\(/.test(String(value))) return { preserve: true };
    return {};
  },
});
await writeFile(
  new URL('./style-inventory.json', import.meta.url),
  JSON.stringify(inventory),
);
