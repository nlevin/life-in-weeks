import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Development only: lets the palette explorer save a palette into the Graphical
// theme, then regenerates graphical/generated/theme.css from it.
function paletteSave() {
  const KEY = /^(color-([1-9]|10)|neutral-([1-9]|10))$/;
  const HEX = /^#[0-9a-f]{6}$/i;
  const valid = (o) => o && typeof o === "object" && Object.entries(o).every(([k, v]) => KEY.test(k) && HEX.test(v));
  return {
    name: "palette-save",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__palette/save", async (req, res) => {
        const send = (status, body) => { res.statusCode = status; res.setHeader("content-type", "application/json"); res.end(JSON.stringify(body)); };
        if (req.method !== "POST" || req.headers["x-palette-save"] !== "1") return send(405, { error: "Use POST from the palette explorer." });
        try {
          let body = "";
          for await (const chunk of req) body += chunk;
          const { light, dark } = JSON.parse(body);
          if (!valid(light) || !valid(dark)) return send(400, { error: "Expected color-N and neutral-N keys with hex values." });
          const root = server.config.root;
          const path = `${root}/graphical/themes/graphical.json`;
          const doc = JSON.parse(await readFile(path, "utf8"));
          Object.assign(doc.theme.colors.light, light);
          Object.assign(doc.theme.colors.dark, dark);
          await writeFile(path, `${JSON.stringify(doc, null, 2)}\n`);
          const bin = fileURLToPath(new URL("./node_modules/@graphical/editor/dist/graphical-install.js", import.meta.url));
          await new Promise((resolve, reject) =>
            execFile(process.execPath, [bin, "--theme", "graphical"], { cwd: root }, (err, out, errOut) =>
              err ? reject(new Error((errOut || err.message).trim())) : resolve()));
          send(200, { ok: true });
        } catch (err) {
          send(500, { error: err.message });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), paletteSave()],
});
