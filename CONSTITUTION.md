# Support Ticket Hub - Project Constitution v1.0

**Ratified**: 2026-09-23  
**Version**: 1.0.0  
**Status**: Active

---

## Core Principles

### I. Mandated Technology Stack (NON-NEGOTIABLE)

The system MUST be built on:

- **Backend**: Java 21 LTS with Spring Boot 3.5+ (REST, JPA, Security, Validation, Actuator)
- **Database**: PostgreSQL 16+ with Flyway migrations (schema-as-code, forward-only)
- **Frontend**: Next.js 15+ App Router with TypeScript strict mode
- **Testing**: JUnit 5 (backend), Vitest (frontend), Testcontainers PostgreSQL, Playwright E2E
- **Build**: Maven for backend, npm/pnpm for frontend
- **Deployment**: Docker containers, docker-compose for local dev

**Rationale**: A fixed, mainstream stack ensures predictable hiring, tooling, and long-term maintainability.

---

### II. Strict State Machine Enforcement

**All** ticket status transitions MUST follow the enforced state machine:

```
OPEN ──→ IN_PROGRESS ──→ RESOLVED ──→ CLOSED
 ├─→ CANCELLED ←──────────────────┘
```

**Non-negotiable constraints**:
- Backend MUST reject invalid transitions at service layer (+ optional DB constraints)
- Frontend MUST validate transitions before sending requests
- Every transition MUST be logged to immutable `ticket_history` table
- Closed tickets MUST be read-only (no field updates allowed)
- Comments are ALWAYS allowed, even on closed tickets

**Rationale**: Ticket state is the system's single source of truth for SLA tracking and audit compliance.

---

### III. Secrets & Environment-Driven Configuration

**Zero tolerance**:
- NO secrets committed: passwords, API keys, tokens, JWT keys, connection strings anywhere
- ALL configuration sourced from environment variables
- `.env` is git-ignored; `.env.example` is committed
- Backend fails fast at startup if required env vars missing
- Gitleaks pre-commit hook enforces this

**Rationale**: Leaked credentials are the #1 breach vector. Environment-driven config enables the same build artifact to deploy everywhere.

---

### IV. API-First REST Design

All backend functionality MUST be accessible via REST API:
- OpenAPI 3.0 spec (REQUIRED, source of truth for frontend)
- RFC 9457 Problem Details for all errors (not HTML, not stack traces)
- Optimistic locking (ETag + `If-Match`) for state-changing operations
- Pagination + sorting + filtering on all list endpoints
- JPA entities NEVER exposed; DTOs mandatory
- Correct HTTP status codes and verbs

**Rationale**: Explicit contracts decouple frontend/backend and enable safe integrations.

---

### V. Comprehensive Testing & Quality Gates

**Non-negotiable**:
- Unit tests: 80%+ coverage on service/domain layers
- Integration tests: Testcontainers PostgreSQL (NOT H2)
- State machine: ALL 16 transition pairs tested (5 valid, 11 invalid)
- E2E tests: Playwright for critical user journeys
- CI MUST run full test suite on every PR; failing tests block merge
- Contract tests verify OpenAPI compliance

**Rationale**: Workflow rules are easy to break silently; automated tests are the only scalable guard.

---

### VI. Immutable Audit Trail

EVERY ticket mutation MUST create an immutable history record:
- Field name, old value, new value
- Who changed it, when (UTC timestamp)
- Change type (UPDATE, STATUS_CHANGE, ASSIGNMENT, COMMENT_ADDED)

**No hard deletes** of business data. Only soft deletes or archival.

**Rationale**: Ticketing is a system of record; history and auditability are non-negotiable.

---

### VII. Security & Authorization

- Authentication: JWT via HttpOnly, SameSite=Strict cookies
- CSRF protection: Double-submit token on state-changing requests
- Authorization: Role-based (REQUESTER, AGENT, MANAGER, ADMIN)
- All input validated server-side
- Parameterized queries (no SQL injection)
- Rendered user content sanitized (no XSS)
- Dependencies scanned for vulns in CI; critical/high findings block release

**Rationale**: Support tickets contain customer PII and internal details; OWASP Top 10 is the minimum baseline.

---

### VIII. Performance & Accessibility

- P95 response time < 200ms for reads, < 500ms for writes
- WCAG 2.1 AA compliance (frontend)
- Keyboard navigation + screen reader friendly
- Responsive design (desktop + mobile)
- Search indexed for fast full-text queries

**Rationale**: Support agents live in this tool; speed and accessibility directly impact resolution times.

---

## Development Workflow

### Spec-Driven Development (MANDATORY)

Every feature follows:
1. **Requirements** → Write `REQUIREMENTS.md`
2. **Specification** → Write detailed `SPEC.md` with examples
3. **Plan** → Break into tasks, estimate, identify risks
4. **Implementation** → Code with tests, follow constitution checks
5. **Review** → PR review verifies constitution compliance
6. **Release** → Deploy with migrations

### Commit & PR Guidelines

- Commits: Follow Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`)
- PR title: Short, imperative (`Add status transition validation`, not `Added status stuff`)
- PR description: Link to spec, state testing done, mention breaking changes
- All PRs require 1+ approving review
- No direct pushes to `master`; all changes via PR

### Code Style

**Backend**:
- Format: Spotless/Checkstyle (enforced pre-commit, CI fails if violated)
- Naming: camelCase, class names PascalCase, constants UPPER_SNAKE
- Records for DTOs, sealed types for enums, pattern matching where applicable

**Frontend**:
- Format: Prettier
- Lint: ESLint with Next.js config
- Type: TypeScript strict mode (no `any`, use `unknown` if needed)
- Naming: camelCase, components PascalCase, constants UPPER_SNAKE

### Deployment

- Docker images for both backend and frontend
- `docker-compose.yml` for local development (includes PostgreSQL, Redis optional)
- No hardcoded environment values in code
- Helm charts or equivalent for Kubernetes (future)
- Database migrations run automatically at startup (Flyway handles this)

---

## Decision Records

### Why Spring Boot?
Mature, battle-tested, excellent Spring Data JPA, Spring Security, extensive ecosystem.

### Why PostgreSQL (not H2)?
H2 can silently differ from production. Testcontainers PostgreSQL is the integration test standard.

### Why Next.js (not vanilla React)?
Server components reduce JS shipped to browser, built-in optimization, API routes for proxy.

### Why Optimistic Locking?
Prevents silent overwrites in concurrent edits. Users see clear conflict messages.

### Why Immutable History?
Audit compliance, SLA tracking, bug investigation. Immutability guarantees integrity.

---

## Governance & Amendments

- This constitution SUPERSEDES all other guidelines for this project
- Amendments require a PR editing this file with rationale + migration plan
- Versioning: MAJOR (principles removed), MINOR (new principles), PATCH (clarifications)
- Every plan/PR MUST include constitution compliance checklist

---

## Checklist for PRs

Before marking ready for review:

- [ ] Code follows mandated tech stack
- [ ] All secrets removed (gitleaks pre-commit)
- [ ] State machine transitions validated (if ticket-related)
- [ ] Tests added/updated (80%+ coverage on new code)
- [ ] Integration tests use Testcontainers PostgreSQL
- [ ] E2E tests added for new user journeys
- [ ] API spec (OpenAPI) updated if new endpoints
- [ ] RFC 9457 errors used (no stack traces in responses)
- [ ] Optimistic locking used for concurrent updates
- [ ] Immutable history logged for mutations
- [ ] Database migration included (Flyway)
- [ ] No hardcoded env values
- [ ] Commit messages follow Conventional Commits
- [ ] README/docs updated

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-23 | Initial ratification |

**Next review**: 2026-12-23
