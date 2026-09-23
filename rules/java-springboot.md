# Java / Spring Boot Guidelines

Applies to everything under `backend/`.

## Language & framework versions

- Java 21 — use records for DTOs, switch expressions for enum logic
  (see `IssueState.canTransitionTo()`), `var` only when the type is obvious
  from the right-hand side.
- Spring Boot 3.5.x. Constructor injection only — never `@Autowired` on
  fields. No field injection anywhere in this codebase.

## Package structure: package-by-feature, not package-by-layer

```
com.supportticket.<feature>/
  api/          REST controllers + request/response DTOs (records)
  entity/       JPA entities
  repository/   Spring Data repositories
  service/      business logic, transaction boundaries
```

Features so far: `issue`, `user`, `common` (cross-cutting: enums,
exceptions, config). A new feature gets its own top-level package with
this same shape — don't add a 6th layer folder at the top (`controllers/`,
`services/` etc. spanning all features).

## Entities

- Every entity gets an explicit `@Column(name = "...")` — never rely on
  Hibernate's implicit naming strategy matching the migration's actual
  column names. A mismatch here fails silently until runtime.
- Optimistic locking via `@Version` (`concurrency_version` column) on any
  entity that can be concurrently edited (`Issue`, `IssueMessage`).
- Timestamps are `OffsetDateTime`, set explicitly in code
  (`OffsetDateTime.now()`), not via `@CreationTimestamp` — keeps
  create/update logic visible in the service layer instead of hidden in
  annotations.

## Migrations (Flyway)

- One migration per logical change, never edit a migration that has
  already shipped — add a new `V00N__description.sql` instead.
- Every `CREATE TABLE` needs `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4` (this
  project targets MySQL — see `docs/ai-mistakes-and-fixes.md` for what
  broke when this was ported from a Postgres-flavored schema).
- `ddl-auto` is **always** `validate`, never `update` or `create` outside
  of the `test` profile. Schema changes go through Flyway, full stop.

## Business rules live in the service layer, not the controller

Controllers do request/response mapping and nothing else. State-machine
enforcement, the "closing requires an assignee" rule, optimistic-lock
handling — all of it belongs in `*Service` classes so it's unit-testable
without spinning up MockMvc.

## Errors

- Domain exceptions (`InvalidStateTransitionException`,
  `EntityNotFoundException`, `IllegalStateException`,
  `IllegalArgumentException`) are translated to HTTP responses in exactly
  one place: `GlobalExceptionHandler` (`@RestControllerAdvice`). Controllers
  never catch-and-translate locally.
- Never let a raw `DataIntegrityViolationException` (a DB constraint
  failure) reach the client as a 500 with a stack trace. If a business
  rule can be violated at the DB level, validate it in the service layer
  first with a clear message, and keep the DB constraint as a backstop
  (see the state-machine's "must be assigned to close" rule for the
  pattern).

## Security config

Every environment needs an explicit `SecurityFilterChain` bean. Spring
Security on the classpath with **no** config auto-generates a random
password and locks every endpoint — this is not a safe default to leave
unconfigured "for now." See `SecurityConfig.java` and
`docs/ai-mistakes-and-fixes.md` (mistake #2) for what happens if you skip
this.
