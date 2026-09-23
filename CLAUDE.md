# Project Memory

Support Ticket Hub — Java 21 / Spring Boot backend, Next.js frontend,
MySQL locally (see note below). This file is what Claude Code loads
automatically; it's a pointer to the real steering docs, not a
restatement of them.

## Read before making changes

| Topic | File |
|---|---|
| High-level principles, tech stack, non-negotiables | `CONSTITUTION.md` |
| Java/Spring Boot conventions | `rules/java-springboot.md` |
| Testing conventions | `rules/testing.md` |
| API conventions | `rules/api-standards.md` |
| Doc-sync conventions | `skills/documentation/README.md` (`.claude/skills/documentation/` — `/documentation`) |
| Requirements | `spec/requirements.md` |
| Architecture | `spec/architecture.md` |
| Data model / schema | `spec/data-model.md` |
| REST API contract | `spec/api-contract.md` |
| State machine (the enforced OPEN→IN_PROGRESS→RESOLVED→CLOSED / →CANCELLED rules) | `spec/state-machine.md` |
| UI flows | `spec/ui-flow.md` |
| Test strategy | `spec/test-strategy.md` |
| Real mistakes made + fixes (read this before assuming a pattern is safe) | `docs/ai-mistakes-and-fixes.md` |
| Every prompt this project has been given | `docs/prompt-history.md`, `.specstory/history/` |

## Slash commands available in this repo

- `/review-code` — review a diff against `rules/*.md`
- `/review-spec` — check `spec/*.md` for drift against the real code
- `/generate-tests` — generate tests matching this repo's conventions
- `/documentation` — sync docs after a change

(Portable, IDE-agnostic versions of each live under `commands/` and
`skills/` at the repo root.)

## Known doc drift — don't copy blindly

- `CONSTITUTION.md` says PostgreSQL; the project was switched to MySQL
  for local development partway through (see
  `MYSQL_LOCAL_SETUP.md`/`QUICK_START.md`). H2 is still used for tests.
  If you're touching database config, MySQL is current reality —
  `CONSTITUTION.md` needs an update, not the other way around.
- Naming is intentionally different from generic ticket-system vocabulary
  (`NEWLY_OPENED` not `OPEN`, `severityLevel` not `priority`, etc.) — this
  was a deliberate no-plagiarism requirement from the original
  assignment, not an inconsistency to "fix." See `spec/state-machine.md`
  for the full renaming table.

## Backend/frontend integration reality (as of now)

- No JWT/session auth — the frontend sends `X-User-ID`, defaulted
  server-side to `1` when absent. This is a deliberate scope cut; don't
  build more UI assuming real auth exists without calling that out.
- `GET /issues` returns a Spring `Page<>` wrapper (`{content, ...}`), not
  a bare array — every frontend consumer must read `.content`.
- CORS allows any `localhost:*` origin (the dev server's port isn't
  stable), not one hardcoded port.

## Token optimization note

This session relies on Claude Code's own prompt caching (this file plus
`rules/`/`spec/` content gets cached across turns) rather than an
external context-compression plugin (Graphify/Caveman/Codebase-memory
MCP were evaluated but not installed — the codebase is small enough that
targeted `grep`/`Read` of specific files stayed cheaper than running a
persistent indexing MCP server for it). Keep this file and the `rules/`
files short and pointer-shaped (as done above) rather than inlining full
content — that's the actual token-saving lever available here: avoid
re-reading full spec files when a link and a one-line summary answers
the question.
