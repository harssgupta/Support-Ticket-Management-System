# /generate-tests

Portable spec for a test-generation command (executable version:
`.claude/commands/generate-tests.md`, invoked as `/generate-tests`).

## Purpose

Generate tests for a given class/endpoint/feature that follow this
repo's actual testing conventions (`rules/testing.md`), not generic
JUnit boilerplate.

## What it does

1. Identify what's untested: a service method, a controller endpoint, or
   a state-machine transition with no corresponding case in
   `IssueStateTransitionTest`.
2. Match the existing style exactly:
   - Unit test naming: `test<Scenario>_<ExpectedOutcome>()`
   - State-machine tests: one method per transition, not a loop with
     asserts buried inside (readability over DRY for this specific suite
     — see `IssueStateTransitionTest` for the pattern)
   - Integration tests: real repository calls via `@SpringBootTest`,
     assert against what's actually persisted, not just the return value
3. For every new endpoint test, cover: the happy path, at least one
   validation failure (400), and — if the endpoint touches issue state —
   the specific 422 invalid-transition case.
4. Never mock what an integration test's whole point is to exercise (the
   repository/database layer, in an `*IntegrationTest`).

## Output

The generated test file(s), plus a one-line note on what scenario each
new test method covers and which existing gap (from step 1) it closes.
