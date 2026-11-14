// Import input for the Graphical install. Run from the app root:
//   node graphical/install/import.mjs
import { writeFile } from 'node:fs/promises';
import { cssVariablesProfile } from '@graphical/editor/install';

const css = (selector) => ({ path: 'src/styles.css', selector });

// Every token the app defines, and the Graphical token closest to its meaning.
// The app has a warm paper-and-ink neutral ramp, one accent and a focus blue.
const roleMap = cssVariablesProfile({
  modes: { kind: 'media' },
  tokens: [
    { variable: '--paper', token: 'neutral-1', defined: css(':root') }, // page surface
    { variable: '--card', token: 'neutral-2', defined: css(':root') }, // trays, inputs' parents, answer cards
    { variable: '--line', token: 'neutral-4', defined: css(':root') }, // hairlines and control edges
    { variable: '--empty', token: 'neutral-5', defined: css(':root') }, // unpainted weeks, empty ribbon
    { variable: '--faint', token: 'neutral-6', defined: css(':root') }, // hints, axis labels
    { variable: '--muted', token: 'neutral-7', defined: css(':root') }, // secondary text
    { variable: '--ink', token: 'neutral-10', defined: css(':root') }, // text and the primary action fill
    { variable: '--accent', token: 'color-1', defined: css(':root') }, // this week, destructive labels, active drag
    { variable: '--focus', token: 'color-2', defined: css(':root') }, // keyboard focus outline
    { variable: '--veil', token: 'neutral-1', derive: { alpha: 0.55 }, defined: css(':root') }, // wash over the future
    { variable: '--font', token: 'font.body', defined: css(':root') },
    { variable: '--display', token: 'font.display', defined: css(':root') },
  ],
  // Layout geometry, not theme: the sticky bar height and the measured Tracks header height.
  fixed: ['--barh', '--thead'],
  appearance: {
    initial: { navigation: 'blended', grouping: 'cards', surface: 'outlined' },
    navigation: { selector: '.bar', background: '--paper', border: '--line' },
    cards: { selector: '.tray, .ans', background: '--card' },
  },
});

// The app's own values in Graphical's slots. Install fills the rest.
// The app authors seven neutrals per mode; steps 3, 8 and 9 sit between its
// authored neighbors so the ramp is whole. It has no status colors of its own,
// so those keep Graphical's defaults.
const document = {
  name: 'A life in weeks',
  theme: {
    primaryActionColor: 'neutral-10',
    colors: {
      light: {
        'color-1': '#C8553D',
        'color-2': '#3D6FD9',
        'neutral-1': '#F6F2EA',
        'neutral-2': '#FBF8F2',
        'neutral-3': '#EDE7DB',
        'neutral-4': '#E4DCCD',
        'neutral-5': '#D6CDBC',
        'neutral-6': '#9C9384',
        'neutral-7': '#6F675B',
        'neutral-8': '#4A443B',
        'neutral-9': '#2F2B24',
        'neutral-10': '#1E1B16',
        success: '#76ef6b',
        warning: '#ffa344',
        error: '#ff5263',
      },
      dark: {
        'color-1': '#EB7A5E',
        'color-2': '#7FA2F0',
        'neutral-1': '#14120F',
        'neutral-2': '#1C1915',
        'neutral-3': '#25211C',
        'neutral-4': '#2D2923',
        'neutral-5': '#3A342C',
        'neutral-6': '#776F61',
        'neutral-7': '#A39A88',
        'neutral-8': '#C3BAA8',
        'neutral-9': '#DCD4C5',
        'neutral-10': '#EEE7DA',
        success: '#76ef6b',
        warning: '#ffa344',
        error: '#ff5263',
      },
    },
    fonts: {
      body: { family: "'Instrument Sans', system-ui, sans-serif", weights: { regular: 400, medium: 500, heavy: 600 } },
      display: { family: "'Fraunces', Georgia, serif", weights: { regular: 400, medium: 600, heavy: 600 } },
      data: { family: "'Instrument Sans', system-ui, sans-serif", weights: { regular: 400, medium: 500, heavy: 600 } },
    },
  },
};

// The app's authored value for each mapped variable, per mode.
const source = {
  light: {
    '--paper': '#F6F2EA', '--card': '#FBF8F2', '--line': '#E4DCCD', '--empty': '#D6CDBC', '--faint': '#9C9384',
    '--muted': '#6F675B', '--ink': '#1E1B16', '--accent': '#C8553D', '--focus': '#3D6FD9', '--veil': 'rgba(246,242,234,.55)',
    '--font': '"Instrument Sans",system-ui,sans-serif', '--display': '"Fraunces",Georgia,serif',
  },
  dark: {
    '--paper': '#14120F', '--card': '#1C1915', '--line': '#2D2923', '--empty': '#3A342C', '--faint': '#776F61',
    '--muted': '#A39A88', '--ink': '#EEE7DA', '--accent': '#EB7A5E', '--focus': '#7FA2F0', '--veil': 'rgba(20,18,15,.55)',
    '--font': '"Instrument Sans",system-ui,sans-serif', '--display': '"Fraunces",Georgia,serif',
  },
};

await writeFile(
  new URL('./import.json', import.meta.url),
  `${JSON.stringify({ document, roleMap, source }, null, 2)}\n`,
);
