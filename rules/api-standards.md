# API Standards

Base path: `/api/v1` (`server.servlet.context-path`, see `application.yml`).

## Resource shape

- `POST   /issues`                 create
- `GET    /issues`                 search/list (filters: `searchTerm`, `state`, `severity`; paginated via Spring `Pageable` — response is a `Page<>` wrapper, `{content, totalElements, ...}`, **not** a bare array)
- `GET    /issues/{id}`             detail
- `PATCH  /issues/{id}`             update fields (subject, description, severity, assignee) — **not** PUT; a PATCH is a partial update by convention even though this project's DTO currently requires the full set of fields
- `PATCH  /issues/{id}/state`       state transition only (separate endpoint from the general update — a transition is a distinct, audited operation, not just a field edit)
- `GET/POST /issues/{id}/messages`  comments
- `POST  /auth/login`               authentication
- `GET   /users`                    list assignable accounts

## Status codes

| Code | When |
|---|---|
| 200 | successful GET/PATCH |
| 201 | successful POST (creation) |
| 400 | validation failure, illegal argument/state (e.g. closing an unassigned ticket) |
| 404 | entity not found |
| 422 | invalid state transition specifically — distinct from a generic 400 because the client needs the list of allowed transitions to recover, not just "bad request" |
| 500 | reserved for genuinely unexpected failures — never used for `IllegalStateException`/`IllegalArgumentException` (see `GlobalExceptionHandler`) |

## Error response shape

Every error response (`GlobalExceptionHandler`) is:

```json
{ "status": 422, "message": "human-readable, specific", "timestamp": "..." }
```

`message` must say what happened and, wherever possible, what's needed to
fix it (e.g. "Cannot close an unassigned issue. Assign it to someone
first." — not just "Bad request"). This is what the frontend surfaces
directly in toast notifications, so it's user-facing copy, not a debug log.

## Auth

No JWT/session was implemented (out of scope for this exercise) — the
frontend sends an `X-User-ID` header, defaulted server-side to `1` when
absent so read endpoints degrade gracefully rather than 401ing. This is a
deliberate scope cut, not an oversight — a real deployment needs proper
session/token auth before this header-based approach is acceptable.

## CORS

Configured via `allowedOriginPatterns` (`http://localhost:*`), not a
single hardcoded origin — a Next.js dev server hops ports when the
default is taken, and a CORS allow-list of exactly one port breaks the
moment that happens (this exact thing happened during development — see
`docs/ai-mistakes-and-fixes.md`).

## Request/response DTOs

Java `record`s, defined next to the controller that uses them (as static
nested types), not shared "common DTO" classes reused across endpoints
with different meaning per field. `IssueResponse`, `CreateIssueRequest`
etc. each belong to one controller.
