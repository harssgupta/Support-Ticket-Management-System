---
description: Review the current diff against this repo's own coding standards (rules/*.md), not generic best practices
---

Full checklist: `commands/review-code.md` at the repo root.

Review the current uncommitted changes (or, if the user names a commit
range/PR, that range instead) against:

1. `rules/java-springboot.md` — constructor injection, package-by-feature
   placement, explicit `@Column` names, business logic in the service
   layer not controllers, errors routed through `GlobalExceptionHandler`.
2. `rules/api-standards.md` — correct status codes (422 specifically for
   invalid state transitions), actionable error messages, per-controller
   DTOs.
3. `rules/testing.md` — does new code have a corresponding test in the
   same change; do state-machine changes cover both valid and invalid
   paths.
4. Correctness — does the diff do what it claims; any silent breaking
   change to an existing response shape.
5. Security — no secrets, no endpoint left unintentionally open or
   locked without updating the frontend to match.

Report findings as: file:line, what's wrong, the concrete failure
scenario (not "best practice"), and whether it blocks. If there's
nothing wrong, say so — don't manufacture nitpicks.
