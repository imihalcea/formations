#!/bin/bash
# PostToolUse hook: formats the edited Python file, then runs the tests.
# Exit code 2 sends stderr to Claude, which then sees the failing tests.

FILE_PATH=$(jq -r '.tool_input.file_path // empty')
[[ "$FILE_PATH" == *.py ]] || exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 1
uv run ruff format --quiet "$FILE_PATH"

if ! OUTPUT=$(uv run pytest -q 2>&1); then
  echo "Tests fail after editing $FILE_PATH:" >&2
  echo "$OUTPUT" | tail -n 15 >&2
  exit 2
fi
exit 0
