# /review-spec

Portable spec for a specification-review command (executable version:
`.claude/commands/review-spec.md`, invoked as `/review-spec`).

## Purpose

Check that `spec/*.md` is internally consistent and matches the actual
implementation — specs drift from code constantly; this command exists
to catch that drift before it compounds.

## Checklist it applies

1. **Internal consistency**: does `spec/data-model.md` describe the same
   columns/types as the latest Flyway migrations; does
   `spec/state-machine.md`'s transition table match
   `IssueState.canTransitionTo()` exactly; does `spec/api-contract.md`
   list every controller endpoint that actually exists (and nothing that
   doesn't).
2. **Completeness against the assignment**: every item in the original
   requirements (create/list/view/update/comment/search/filter/persist/
   validate/error-display, plus the exact state machine) has a
   traceable line in `spec/requirements.md` and an implementation.
3. **No aspirational content**: nothing in `spec/*.md` describes a
   feature that isn't actually built (that belongs in `PLAN.md` instead).
4. **Naming consistency**: the no-plagiarism renaming (OPEN→NEWLY_OPENED
   etc.) is applied consistently across every spec file, not just some.

## Output format

A gap list: `spec file → what's missing/wrong → what the code actually
does instead`. If specs and code fully agree, say so.
