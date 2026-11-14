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
    // Chapter and lens colors are content: people pick them per category, and
    // the sample life's palette and the label ink computed for them live in the model.
    if (path.endsWith('src/model.js')) return { preserve: true };
    return {};
  },
});
await writeFile(
  new URL('./style-inventory.json', import.meta.url),
  JSON.stringify(inventory),
);
