---
description: Generate tests for a class/endpoint/feature following this repo's actual testing conventions (rules/testing.md)
---

Full spec: `commands/generate-tests.md` at the repo root.

Given the class, endpoint, or feature the user names (ask if unclear):

1. Identify what's untested — a service method, controller endpoint, or
   state-machine transition with no case in `IssueStateTransitionTest` /
   `IssueManagementIntegrationTest`.
2. Match the existing style exactly:
   - Unit tests: `test<Scenario>_<ExpectedOutcome>()` naming
   - State-machine tests: one method per transition, not a loop with
     asserts buried inside — see `IssueStateTransitionTest` for the
     pattern to copy
   - Integration tests: real repository calls via `@SpringBootTest`,
     assert against what's actually persisted
3. For a new endpoint, cover: happy path, at least one validation
   failure (400), and — if it touches issue state — the 422
   invalid-transition case specifically.
4. Never mock the layer an integration test exists to exercise.

Output the generated test file(s) plus a one-line note per new test
method: what scenario it covers and which gap it closes.
