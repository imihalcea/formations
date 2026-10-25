// Boucle externe avec le Claude Agent SDK (@anthropic-ai/claude-agent-sdk) : le programme
// tient le critère (make test), la borne (MAX_ITER) et le journal ; chaque relance est un
// appel à query() avec ses propres plafonds de tours et de coût.
// Authentification : ANTHROPIC_API_KEY, ou CLAUDE_CODE_USE_BEDROCK=1 avec des identifiants AWS.
// Usage, depuis la racine du dépôt : npx tsx scripts/fix-loop-claude.ts "objectif"
import { execSync } from "node:child_process"
import { query } from "@anthropic-ai/claude-agent-sdk"

const objectif = process.argv[2]
if (!objectif) {
  console.error('usage: npx tsx scripts/fix-loop-claude.ts "objectif"')
  process.exit(2)
}
const MAX = Number(process.env.MAX_ITER ?? 5)
const MAX_TURNS = Number(process.env.MAX_TURNS ?? 30)
const MAX_BUDGET_USD = Number(process.env.MAX_BUDGET_USD ?? 2)

function testsPassent(): boolean {
  try {
    execSync("make test", { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

type Relance = { iteration: number; subtype: string; tours: number; cout_usd: number }
const journal: Relance[] = []
let corrige = testsPassent()
let iterations = 0

for (let i = 1; i <= MAX && !corrige; i++) {
  iterations = i
  const sortie = execSync("make test 2>&1 | tail -40 || true").toString()
  for await (const message of query({
    prompt:
      `Objectif : ${objectif}\n\nSortie de make test :\n${sortie}\n\n` +
      "Corrige la cause dans le code de l'application, jamais dans les tests.",
    options: {
      cwd: process.cwd(),
      model: "claude-sonnet-4-6",
      agent: "implementeur",
      settingSources: ["project"],
      permissionMode: "acceptEdits",
      maxTurns: MAX_TURNS,
      maxBudgetUsd: MAX_BUDGET_USD,
    },
  })) {
    if (message.type === "result") {
      journal.push({
        iteration: i,
        subtype: message.subtype,
        tours: message.num_turns,
        cout_usd: message.total_cost_usd,
      })
      console.error(`relance ${i} / ${MAX} : ${message.subtype}, ${message.num_turns} tours, ${message.total_cost_usd} USD`)
    }
  }
  corrige = testsPassent()
}

console.log(JSON.stringify({ corrige, iterations, journal }))
process.exit(corrige ? 0 : 1)
