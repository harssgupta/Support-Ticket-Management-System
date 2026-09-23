# Testing Guidelines

## Pyramid for this project

1. **Unit tests** (JUnit 5) — pure logic, no Spring context.
   `IssueStateTransitionTest` is the model: 16 cases covering every valid
   transition, every invalid transition, and the terminal/modifiable-state
   checks. State-machine logic is exactly the kind of thing that should
   have one test per edge, not one parameterized "does it work" test.
2. **Integration tests** (`@SpringBootTest` + Testcontainers/H2) — exercise
   real repositories and a real (test) database. `IssueManagementIntegrationTest`
   walks the full happy path (create → transition → transition → transition)
   and asserts an invalid transition throws against a real persistence
   layer, not a mock.
3. **E2E tests** (Playwright) — `ticket-workflow.spec.ts`, drives the actual
   UI against a running backend: create, list, filter, view, transition
   state, add a comment, search, and validation-error display.

## Non-negotiables

- **State machine tests are mandatory, not optional.** Every valid edge and
  every invalid edge from `spec/state-machine.md` needs its own test case.
  "Covered by the happy-path integration test" is not coverage for the
  rejection paths.
- Integration tests must hit a real (or Testcontainers-backed) database,
  not a mocked repository — a mocked repository can't catch a Flyway
  migration mismatch, a missing `@Column` mapping, or a DB CHECK
  constraint violation, and all three of those were real bugs in this
  project (see `docs/ai-mistakes-and-fixes.md`).
- New backend endpoint → new controller/service test in the same PR.
  Don't let "I'll add tests later" ship.
- Don't assert on incidental details (exact error message wording,
  timestamp formatting) — assert on status codes, state, and the presence
  of the meaningful part of a message.

## Naming

`test<Scenario>_<ExpectedOutcome>()` for the state-machine suite
(`testValidTransition_NewlyOpenedToInWork`,
`testInvalidTransition_ClosureToAnyState`) — the test name alone should
tell you what broke without opening the file.

## Running

```bash
cd backend
mvn test                 # unit
mvn verify                # unit + integration (failsafe)
cd ../frontend
npx playwright test      # E2E, needs backend + frontend running
```
