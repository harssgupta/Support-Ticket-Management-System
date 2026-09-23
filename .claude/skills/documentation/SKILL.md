---
name: documentation
description: Keep spec/*.md, rules/*.md, and code doc-comments in sync with what the code actually does after a change. Use after adding/changing an endpoint, entity, migration, or state-machine transition.
---

# Documentation Sync Skill

Full guidelines: see `skills/documentation/README.md` at the repo root
(portable version, IDE-agnostic).

## What to do when invoked

1. Identify what changed (git diff of the current branch/session against
   `master`, or ask the user what they just implemented if unclear).
2. Map the change to the doc file(s) it affects:
   - New/changed REST endpoint → `spec/api-contract.md`
   - New/changed entity or migration → `spec/data-model.md`
   - New/changed state-machine transition → `spec/state-machine.md` AND
     the doc-comment on `IssueState.canTransitionTo()`
   - New/changed UI flow or page → `spec/ui-flow.md`
   - A bug that was found and fixed → `docs/ai-mistakes-and-fixes.md`
     (see that file's existing entries for the expected format)
3. Update the doc file(s) to describe **current** behavior only — remove
   or correct anything the change made stale, don't just append.
4. If the change reveals two files disagreeing (e.g. the spec says one
   thing, the code does another, and neither was "the change"), flag it
   to the user rather than silently picking one to trust.
5. Keep edits terse: tables over prose, no restating what a code link
   already shows.

Do not create new top-level doc files without being asked — extend the
existing `spec/*.md` / `rules/*.md` / `docs/*.md` files.
