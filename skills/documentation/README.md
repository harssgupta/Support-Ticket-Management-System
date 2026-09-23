# Documentation Skill

Reusable instructions for keeping this repo's documentation honest —
i.e. matching what the code actually does, not what it was originally
planned to do.

This is committed as a portable spec (works with any IDE/assistant); the
Claude-Code-executable version lives at
`.claude/skills/documentation/SKILL.md` and is invoked as `/documentation`.

## When to use this

- After adding or changing a REST endpoint → update `spec/api-contract.md`.
- After adding/changing a migration or entity → update `spec/data-model.md`.
- After changing state-machine transitions → update `spec/state-machine.md`
  **and** the enum's own doc-comment in `IssueState.java` — they must agree.
- After a bug is found and fixed that reveals a gap between docs and
  reality → add an entry to `docs/ai-mistakes-and-fixes.md` rather than
  silently fixing and moving on.

## Rules

1. **Docs describe current behavior, not aspirational behavior.** If a
   feature is planned but not built, it goes in `PLAN.md` /
   `IMPLEMENTATION_SUMMARY.md`, not in `spec/*.md`, which should always be
   readable as "this is what the system does today."
2. **No duplicated source of truth.** If the same fact needs stating in
   two places (e.g. the state machine), one of them links to the other
   instead of restating it — a diagram in `spec/state-machine.md`, code
   comments in `IssueState.java` that reference the spec file.
3. **Every doc file states its own scope in the first paragraph.** A
   reader landing on any `spec/*.md` file cold should know in one sentence
   what it covers and what it doesn't.
4. **Prefer tables over prose for anything enumerable** (status codes,
   state transitions, environment variables) — tables are what get kept
   up to date; paragraphs are what get skipped when someone's in a hurry.
5. **Code comments explain WHY, never WHAT.** A comment that restates the
   line below it in English gets deleted, not written in the first place.
