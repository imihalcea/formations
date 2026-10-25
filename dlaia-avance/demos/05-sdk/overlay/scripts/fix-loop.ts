// Boucle externe avec le SDK d'Open Code (@opencode/sdk 2.0.32) : le programme tient le
// critère (make test), la borne (MAX_ITER) et le journal ; l'agent implementeur fait
// chaque relance avec ses propres permissions.
// Usage, depuis la racine du dépôt : node scripts/fix-loop.ts "objectif"
import { execSync } from "node:child_process"
import { OpenCode } from "@opencode/sdk"

const objectif = process.argv[2]
if (!objectif) {
  console.error('usage: node scripts/fix-loop.ts "objectif"')
  process.exit(2)
}
const MAX = Number(process.env.MAX_ITER ?? 5)

function testsPassent(): boolean {
  try {
    execSync("make test", { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

type Relance = { iteration: number; reponse: string }
const journal: Relance[] = []
let corrige = testsPassent()
let iterations = 0

if (!corrige) {
  await using opencode = await OpenCode.create()
  const session = await opencode.sessions.create({
    agent: "implementeur",
    location: { directory: process.cwd() },
  })
  for (let i = 1; i <= MAX && !corrige; i++) {
    iterations = i
    const sortie = execSync("make test 2>&1 | tail -40 || true").toString()
    await opencode.sessions.prompt({
      sessionID: session.id,
      text:
        `Objectif : ${objectif}\n\nSortie de make test :\n${sortie}\n\n` +
        "Corrige la cause dans le code de l'application, jamais dans les tests.",
    })
    await opencode.sessions.wait({ sessionID: session.id })
    const messages = await opencode.sessions.context({ sessionID: session.id })
    const dernier = JSON.stringify(messages.at(-1) ?? null)
    journal.push({ iteration: i, reponse: dernier.slice(0, 300) })
    console.error(`relance ${i} / ${MAX}`)
    corrige = testsPassent()
  }
}

console.log(JSON.stringify({ corrige, iterations, journal }))
process.exit(corrige ? 0 : 1)
