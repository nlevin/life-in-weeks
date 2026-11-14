# A life in weeks

A prototype that shows a life as a grid of weeks, with an adjustable life expectancy, life events, and "lenses" (chapters, who you lived with, places) that break the time down.

It explores three interaction directions, switchable from the tabs at the top:

1. **Paint** – the grid is the editor: pick a color and drag across weeks.
2. **Tracks** – a vertical timeline with one column per lens; drag the seams between chapters.
3. **Tell** – one input line: type what happened, or ask a question.

## Run it

It is a single static page with no build step. Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

Data is saved in the browser's localStorage only.
