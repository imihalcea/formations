import { resolve } from "node:path";
import type { Plugin } from "vite";
import { compileDeck } from "./parse.ts";

const ID = "virtual:deck";
const RESOLVED = "\0" + ID;

// Expose le support compilé à l'application sous la forme du module `virtual:deck`.
// En développement, une modification dans support/ ou dans un fichier inclus (tp/) recharge la page.
export function deckPlugin(supportDir: string, watchDirs: string[] = []): Plugin {
  const dir = resolve(supportDir);
  const watched = [dir, ...watchDirs.map((d) => resolve(d))];
  return {
    name: "deck",
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    async load(id) {
      if (id !== RESOLVED) return;
      return `export default ${JSON.stringify(await compileDeck(dir))};`;
    },
    configureServer(server) {
      server.watcher.add(watched);
      server.watcher.on("all", (_event, file) => {
        if (!watched.some((d) => resolve(file).startsWith(d))) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      });
    },
  };
}
