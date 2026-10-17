// After each file edit, formats the Python file with ruff, runs pytest and
// appends the result to the tool output so the model sees it.
import { appendFile } from "node:fs/promises"

const EDIT_TOOLS = ["edit", "write", "patch"]

export const RunTestsAfterEdit = async ({ $, directory }) => ({
  "tool.execute.after": async (input, output) => {
    // Discovery log: which tools fire and with which arguments.
    await appendFile(
      `${directory}/.opencode/plugin-debug.log`,
      JSON.stringify({ tool: input.tool, args: Object.keys(input.args ?? {}) }) + "\n",
    )
    if (!EDIT_TOOLS.includes(input.tool)) return
    const file = input.args?.filePath
    if (file && !file.endsWith(".py")) return
    if (file) await $`uv run ruff format ${file}`.cwd(directory).quiet().nothrow()
    const result = await $`uv run pytest -q`.cwd(directory).quiet().nothrow()
    const tail = result.stdout.toString().split("\n").slice(-15).join("\n")
    output.output += `\n\npytest exited with code ${result.exitCode}:\n${tail}`
  },
})
