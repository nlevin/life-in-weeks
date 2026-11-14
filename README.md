# A life in weeks

A prototype that shows a life as a grid of weeks, with an adjustable life expectancy, life events, and "lenses" (chapters, who you lived with, places) that break the time down.

It explores three interaction directions, switchable from the tabs at the top:

1. **Paint** (`#paint`) – the grid is the editor: pick a color and drag across weeks.
2. **Tracks** (`#tracks`) – a vertical timeline with one column per lens; drag the seams between chapters.
3. **Tell** (`#tell`) – one input line: type what happened, or ask a question.

## Run it

React 19 + Vite.

```
npm install
npm run dev
```

Then open the local URL Vite prints (http://localhost:5173/ by default).

## Theme

The app's styles run on Graphical's design system. The theme is in `graphical/`, and in development a Graphical editor panel opens beside the app; sign in there with your own Graphical account to edit the theme. The editor is not part of production builds.

Two more development-only tools sit beside Graphical's GUI button at the bottom right:

- **Palettes** (the color wheel) previews whole palettes across the app and saves the one you pick into the Graphical theme.
- **Agentation** lets you click any element, write what should change, and copy the notes as markdown to paste into an agent. See [agentation.com](https://www.agentation.com).

## Layout

- `src/model.js` – the shared life model: dates, spans, events and the plain-language parser.
- `src/store.js` – one shared state with undo, saved to the browser's localStorage.
- `src/views/` – the three directions.
- `src/styles.css` – all styles, written with the theme's variables.
- `graphical/` – the theme, the generated `theme.css`, the editor mount and the import record.
- `GUI.md`, `gui/`, `.agents/skills/` – guidance and skills for agents working on the UI.
