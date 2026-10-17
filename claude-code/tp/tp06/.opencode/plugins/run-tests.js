// After each file edit, formats the Python file with ruff, runs pytest and
// appends the result to the tool result so the model sees it.
// Open Code v2 plugin API: default export with an id and a setup function.
import { execFile } from "node:child_process"
import { appendFile } from "node:fs/promises"

const EDIT_TOOLS = ["edit", "write", "apply_patch"]

function run(command, args, cwd) {
  return new Promise((resolve) => {
    execFile(command, args, { cwd }, (error, stdout, stderr) => {
      resolve({ code: error ? (error.code ?? 1) : 0, output: stdout + stderr })
    })
  })
}

export default {
  id: "run-tests",
  setup: async (ctx) => {
    const directory = ctx.location.directory
    await ctx.tool.hook("execute.after", async (event) => {
      // Discovery log: which tools fire, with which input and result shape.
      await appendFile(
        `${directory}/.opencode/plugin-debug.log`,
        JSON.stringify({
          tool: event.tool,
          status: event.status,
          input: event.input,
          content: event.result?.content,
        }) + "\n",
      )
      if (event.status !== "completed" || !EDIT_TOOLS.includes(event.tool)) return
      const file = event.input?.path
      if (file && !file.endsWith(".py")) return
      if (file) await run("uv", ["run", "ruff", "format", file], directory)
      const tests = await run("uv", ["run", "pytest", "-q"], directory)
      const tail = tests.output.trim().split("\n").slice(-15).join("\n")
      const report = `pytest exited with code ${tests.code}:\n${tail}`
      const content = event.result.content
      event.result = {
        ...event.result,
        content:
          typeof content === "string" || content === undefined
            ? `${content ?? ""}\n\n${report}`
            : [...content, { type: "text", text: report }],
      }
    })
  },
}
