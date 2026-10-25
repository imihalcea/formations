import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { deckPlugin } from "./compiler/plugin.ts";

// SUPPORT_DIR choisit le répertoire Markdown compilé : ../../support par défaut,
// exemple/ pour travailler sur le template sans contenu réel.
const supportDir = process.env["SUPPORT_DIR"] ?? resolve(import.meta.dirname, "../../support");

export default defineConfig({
  plugins: [react(), tailwindcss(), deckPlugin(supportDir, [resolve(import.meta.dirname, "../../tp")]), viteSingleFile()],
  build: {
    outDir: process.env["OUT_DIR"] ?? resolve(import.meta.dirname, "../../dist"),
    emptyOutDir: true,
  },
});
