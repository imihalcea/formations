// After each edit of a Python file, runs pytest and appends the result to
// the tool result, so the model sees it. ruff runs before, as a formatter
// declared in opencode.json.
// Open Code v2 plugin API: default export with an id and a setup function.
import { execFile } from "node:child_process"

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
      if (event.status !== "completed" || !EDIT_TOOLS.includes(event.tool)) return
      const file = event.input?.path
      if (file && !file.endsWith(".py")) return
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
