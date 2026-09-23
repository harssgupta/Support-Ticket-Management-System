# /review-code

Portable spec for a code-review command (executable version:
`.claude/commands/review-code.md`, invoked as `/review-code`).

## Purpose

Review the current diff (uncommitted changes, or a given commit range)
against this repo's own standards — not generic best practices, this
repo's actual decisions in `rules/*.md`.

## Checklist it applies

1. **Against `rules/java-springboot.md`**: constructor injection only,
   package-by-feature placement, explicit `@Column` names, business logic
   in service layer not controllers, errors routed through
   `GlobalExceptionHandler`.
2. **Against `rules/api-standards.md`**: correct status codes (422 for
   invalid transitions specifically, not generic 400), error message is
   actionable not just descriptive, DTOs are per-controller records.
3. **Against `rules/testing.md`**: does a new endpoint/service method have
   a corresponding test in the same change; do state-machine changes have
   both a valid- and invalid-path test.
4. **Correctness**: does the diff actually do what its commit message /
   PR description claims; any silent behavior change to an existing
   endpoint's response shape.
5. **Security**: no secrets, no new endpoint left unintentionally
   permissive or newly locked down without the frontend being updated to
   match.

## Output format

A short list of findings, each with: file:line, what's wrong, why it
matters (concrete failure scenario, not "best practice"), and whether it
blocks. No findings ⇒ say so plainly, don't invent minor nitpicks to
justify the review.
