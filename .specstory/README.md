# .specstory/history

This mirrors what the SpecStory extension does for Cursor/VS Code: one
markdown file per day, containing every prompt submitted to the AI
assistant working in this repo, in chronological order.

Since this project is worked on via Claude Code (not Cursor/VS Code, so
the SpecStory extension itself isn't available), the same behavior is
implemented with a Claude Code `UserPromptSubmit` hook instead:

- `.claude/settings.json` registers the hook.
- `.claude/hooks/log-prompt.sh` runs on every prompt submission, appending
  it to `.specstory/history/<YYYY-MM-DD>.md` and to `docs/prompt-history.md`.

No manual step is required — every prompt is captured automatically the
moment it's sent.
