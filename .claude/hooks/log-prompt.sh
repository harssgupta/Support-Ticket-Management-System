#!/bin/bash
# Logs every user prompt submitted to Claude Code into:
#   .specstory/history/<date>.md   (raw, one entry per prompt, SpecStory-style)
#   docs/prompt-history.md          (same content, single running log)
# Triggered by the UserPromptSubmit hook (see .claude/settings.json).

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HISTORY_DIR="$REPO_ROOT/.specstory/history"
DOCS_FILE="$REPO_ROOT/docs/prompt-history.md"

mkdir -p "$HISTORY_DIR"
mkdir -p "$(dirname "$DOCS_FILE")"

INPUT="$(cat)"
PROMPT="$(printf '%s' "$INPUT" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("prompt",""))' 2>/dev/null)"

if [ -z "$PROMPT" ]; then
  exit 0
fi

TIMESTAMP="$(date +"%Y-%m-%d %H:%M:%S %Z")"
DATE_ONLY="$(date +"%Y-%m-%d")"
HISTORY_FILE="$HISTORY_DIR/${DATE_ONLY}.md"

if [ ! -f "$HISTORY_FILE" ]; then
  {
    echo "# Prompt history — $DATE_ONLY"
    echo ""
  } >> "$HISTORY_FILE"
fi

{
  echo "## $TIMESTAMP"
  echo ""
  echo '```'
  echo "$PROMPT"
  echo '```'
  echo ""
} >> "$HISTORY_FILE"

if [ ! -f "$DOCS_FILE" ]; then
  {
    echo "# Prompt History"
    echo ""
    echo "Every prompt submitted to Claude Code in this repository, logged automatically."
    echo "Raw per-day logs also live under \`.specstory/history/\`."
    echo ""
  } >> "$DOCS_FILE"
fi

{
  echo "## $TIMESTAMP"
  echo ""
  echo '```'
  echo "$PROMPT"
  echo '```'
  echo ""
} >> "$DOCS_FILE"

exit 0
