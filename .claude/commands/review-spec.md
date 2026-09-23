---
description: Check spec/*.md for internal consistency and drift against the actual implementation
---

Full checklist: `commands/review-spec.md` at the repo root.

Check that `spec/*.md` is internally consistent and matches the actual
codebase:

1. Internal consistency — does `spec/data-model.md` match the latest
   Flyway migrations; does `spec/state-machine.md`'s transition table
   match `IssueState.canTransitionTo()` exactly (read the actual enum,
   don't assume); does `spec/api-contract.md` list every controller
   endpoint that exists in `backend/src/main/java/.../api/` and nothing
   that doesn't.
2. Completeness against the original assignment requirements (create /
   list / view / update / comment / search / filter / persist / validate
   / error-display / the exact 5-state machine) — each has a traceable
   line in `spec/requirements.md` and a real implementation.
3. No aspirational content in `spec/*.md` — anything planned-but-not-built
   belongs in `PLAN.md`/`IMPLEMENTATION_SUMMARY.md` instead.
4. Naming consistency — the no-plagiarism renaming (OPEN→NEWLY_OPENED
   etc.) applied the same way across every spec file.

Report as: spec file → what's missing or wrong → what the code actually
does instead. If everything agrees, say so plainly.
