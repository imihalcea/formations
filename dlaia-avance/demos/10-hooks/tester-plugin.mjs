// Teste la fonction garde de .opencode/plugins/garde-ci.ts sans Open Code ni modèle.
// Usage : node tester-plugin.mjs
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const ici = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(ici, "artefacts/.opencode/plugins/garde-ci.ts"), "utf8")
const corps = source.split("// debut garde")[1].split("// fin garde")[0]
const garde = new Function(`${corps}; return garde`)()

const cas = [
  ["1", { tool: "edit", input: { path: "/w/tests/unit/test_ticket.py", oldString: "a", newString: "b" } }, true],
  ["1", { tool: "edit", input: { path: "tests/unit/test_ticket.py", oldString: "a", newString: "b" } }, true],
  ["1", { tool: "write", input: { path: "/w/tests/integration/x.py", content: "x" } }, true],
  ["1", { tool: "shell", input: { command: "sed -i s/409/200/ tests/a.py", workdir: "/w" } }, true],
  ["1", { tool: "shell", input: { command: "uv run pytest tests/unit", workdir: "/w" } }, false],
  ["1", { tool: "read", input: { path: "tests/unit/test_ticket.py" } }, false],
  ["1", { tool: "edit", input: { path: "src/tickets/domain/ticket.py", oldString: "a", newString: "b" } }, false],
  ["", { tool: "edit", input: { path: "tests/unit/test_ticket.py", oldString: "a", newString: "b" } }, false],
]
let ko = 0
for (const [env, event, refus] of cas) {
  process.env.SANS_HUMAIN = env
  let refuse = false
  let message = ""
  try { garde(event) } catch (e) { refuse = true; message = e.message }
  if (refuse !== refus) { console.log("KO", JSON.stringify(event), "SANS_HUMAIN=" + env); ko = 1 }
  if (refuse && message !== "Écriture sous tests/ refusée : corrige src/.") { console.log("KO message", message); ko = 1 }
}
if (!ko) console.log("OK garde-ci.ts : 8 événements")
process.exit(ko)
