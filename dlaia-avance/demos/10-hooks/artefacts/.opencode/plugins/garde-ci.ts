import { Plugin } from "@opencode/plugin"

// debut garde
const garde = (event) => {
  if (process.env.CI_EXECUTE !== "1") return
  if (!/edit|write|patch|shell/.test(event.tool)) return
  const cible = event.input.path ?? event.input.command ?? ""
  if (/(^|\/)tests\/|((^|[;&| ])(sed -i|tee|mv|cp|rm) |>>?) *([^;&|]*[ \/])?tests\//.test(cible))
    throw new Error("Écriture sous tests/ refusée : corrige src/.")
}
// fin garde

export default Plugin.define({
  id: "garde-ci",
  setup: async (ctx) => {
    await ctx.tool.hook("execute.before", garde)
  },
})
