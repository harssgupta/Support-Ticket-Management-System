# Quick Reference Guide

## File Locations

| What? | Where? |
|-------|--------|
| **Project principles** | `CONSTITUTION.md` |
| **Quick start** | `GETTING_STARTED.md` |
| **Roadmap** | `PLAN.md` |
| **Improvements** | `IMPROVEMENTS.md` |
| **Status** | `PROJECT_STATUS.md` |
| **This guide** | `QUICK_REFERENCE.md` |

## Specification Quick Links

| Spec | What to Read | Size |
|------|--------------|------|
| **Requirements** | `specs/REQUIREMENTS.md` | What we're building |
| **Architecture** | `specs/ARCHITECTURE.md` | How it's structured |
| **Data Model** | `specs/DATA-MODEL.md` | Database schema + entities |
| **API Contract** | `specs/API-CONTRACT.md` | REST endpoints with examples |
| **UI Flow** | `specs/UI-FLOW.md` | User interface designs |
| **Testing** | `specs/TEST-STRATEGY.md` | How to test everything |

## Common Commands

### Backend

```bash
# Setup
cd backend
source ../.env
./mvnw clean install

# Development
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Testing
./mvnw test                     # Unit tests
./mvnw verify                   # All tests
./mvnw test -Dtest=*Integration*  # Integration only
./mvnw jacoco:report            # Coverage

# Build
./mvnw clean package
docker build -t sth-backend:latest .
```

### Frontend

```bash
# Setup
cd frontend
npm ci

# Development
npm run dev          # Start dev server
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run format       # Format with Prettier

# Testing
npm test             # Unit tests
npm run test:watch   # Watch mode
npm run test:e2e     # E2E tests
npm test -- --coverage  # Coverage

# Build
npm run build
docker build -t sth-frontend:latest .
```

### Docker

```bash
# Full stack
docker-compose up -d --build

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop everything
docker-compose down

# Remove data
docker-compose down -v
```

## State Machine Quick Reference

```
OPEN ─────→ IN_PROGRESS ─────→ RESOLVED ─────→ CLOSED
 │               │
 └─→ CANCELLED ←─┘

Valid: 5 transitions
Invalid: 11 transitions (all others)

Testing: All 16 transitions must be tested
```

## API Endpoints Quick Reference

```bash
# Auth
POST   /auth/login               # Login
POST   /auth/logout              # Logout
GET    /auth/me                  # Current user

# Tickets
GET    /tickets                  # List (with filters)
POST   /tickets                  # Create
GET    /tickets/{id}             # Get details
PATCH  /tickets/{id}             # Update fields
PATCH  /tickets/{id}/status      # Change status
DELETE /tickets/{id}             # Delete

# Comments
POST   /tickets/{id}/comments        # Add comment
PATCH  /tickets/{id}/comments/{cid}  # Edit comment
DELETE /tickets/{id}/comments/{cid}  # Delete comment

# Users
GET    /users                    # List users
GET    /users/{id}               # Get user

# Full spec: specs/API-CONTRACT.md
```

## Key Concepts

### What is "Spec-Driven Development"?

```
1. Write specification (REQUIREMENTS.md)
2. Create architecture (ARCHITECTURE.md)
3. Plan implementation (PLAN.md)
4. Write tests (TEST-STRATEGY.md)
5. Implement code
6. Review against spec
```

### What is "Package-by-Feature"?

```
src/main/java/com/supportticket/
├── auth/          # Everything related to authentication
├── ticket/        # Everything related to tickets
├── comment/       # Everything related to comments
├── user/          # Everything related to users
└── common/        # Shared across features
```

### What is "Optimistic Locking"?

```
1. GET /tickets/123 → returns version=1
2. UPDATE with If-Match: 1
3. If someone else updated (version=2), get 409 Conflict
4. User refreshes and tries again
```

### What is "Immutable Audit Trail"?

```
ticket_history table:
- NEVER delete records
- NEW record for every change
- Captures: field, old value, new value, who, when
- Used for SLA tracking, compliance, debugging
```

## Testing Pyramid

```
              ╱╲
             ╱  ╲       E2E Tests (5-10%)
            ╱    ╲      Playwright
           ╱──────╲
          ╱        ╲    Integration (25-30%)
         ╱          ╲   Testcontainers
        ╱            ╲
       ╱              ╲  Unit Tests (60-65%)
      ╱        ╱───────╲ JUnit 5
     ╱    ╱───╱         ╲
    ╱_╱──╱─────────────────╲
```

**Coverage Target**: 80%+ on service layer

## Environment Setup

```bash
# Create .env from template
cp .env.example .env

# Required values
DB_URL=jdbc:postgresql://postgres:5432/supportticket
DB_USERNAME=postgres
DB_PASSWORD=postgres123
JWT_SECRET=<32+ random bytes from: openssl rand -base64 32>

# Optional
CORS_ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
LOG_LEVEL=INFO
```

## Troubleshooting Quick Tips

| Problem | Solution |
|---------|----------|
| Backend won't start | Check `.env` is loaded: `source .env` |
| Port 8080 in use | Kill it: `lsof -i :8080; kill -9 <PID>` |
| Frontend can't reach backend | Check CORS in `application.yml` |
| Tests failing | Ensure Docker is running: `docker ps` |
| Secrets committed | Pre-commit hook should prevent: `git commit` |
| TypeScript errors | Run: `cd frontend && npm run type-check` |

## Code Quality Checklist

Before committing:

- [ ] Code follows style (Spotless for Java, Prettier for TS)
- [ ] All tests pass locally
- [ ] No secrets in code
- [ ] Coverage hasn't decreased
- [ ] Commit message is clear (Conventional Commits)
- [ ] API spec updated (if new endpoints)
- [ ] Database migration included (if schema change)

## Important Files to Know

| File | Purpose |
|------|---------|
| `CONSTITUTION.md` | The "constitution" — rules that must be followed |
| `specs/REQUIREMENTS.md` | What we're building |
| `specs/API-CONTRACT.md` | How the API looks |
| `backend/pom.xml` | Maven dependencies |
| `frontend/package.json` | npm dependencies |
| `docker-compose.yml` | Local dev stack |
| `backend/src/main/resources/db/migration/` | Database migrations |

## Pre-Commit Hooks

Automatically run on `git commit`:
- ✅ Gitleaks (detects secrets)
- ✅ Spotless (formats Java code)
- ✅ Prettier (formats TypeScript)

If a hook fails, fix the issue and commit again.

## Git Workflow

```bash
# Create feature branch
git checkout -b feat/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feat/my-feature

# PR must pass:
✓ All tests
✓ No secrets
✓ Code quality
✓ Coverage maintained
```

## Commit Message Examples

```bash
# Good
git commit -m "feat: add ticket search"
git commit -m "fix: prevent concurrent edit conflicts"
git commit -m "test: add state machine transition tests"
git commit -m "docs: update API documentation"

# Not good
git commit -m "updates"
git commit -m "misc changes"
git commit -m "wip"
```

## Help! I'm Stuck

1. **Find the relevant spec** — Check `specs/` directory
2. **Check examples** — Look for existing implementation
3. **Read the test** — Tests show how something should work
4. **Ask questions** — Documentation should answer them
5. **Update docs** — If unclear, improve the docs!

## Quick Architecture Overview

```
Browser
   ↓ HTTPS
Next.js (:3000)
   ↓ /api/* proxy
Spring Boot (:8080)
   ↓ JDBC
PostgreSQL (:5432)
```

**Flow**:
1. Browser makes request to Next.js
2. Next.js proxies to Spring Boot
3. Spring Boot queries PostgreSQL
4. Response bubbles back up

## Critical Files by Role

**Backend Developer**:
- `CONSTITUTION.md` — Must follow rules
- `specs/API-CONTRACT.md` — API to implement
- `specs/DATA-MODEL.md` — Database schema
- `backend/pom.xml` — Dependencies

**Frontend Developer**:
- `CONSTITUTION.md` — Must follow rules
- `specs/API-CONTRACT.md` — API to consume
- `specs/UI-FLOW.md` — Pages & flows to build
- `frontend/package.json` — Dependencies

**DevOps/Infrastructure**:
- `docker-compose.yml` — Local dev
- `.env.example` — Configuration
- `Dockerfile` files — Containerization
- `GETTING_STARTED.md` — Setup instructions

## Learning Path

**New to project?** Read in this order:
1. `CONSTITUTION.md` (5 min) — Understand rules
2. `README.md` (10 min) — Project overview
3. `GETTING_STARTED.md` (15 min) — Set up environment
4. Relevant spec (30 min) — Understand your area
5. Existing code (30 min) — See patterns
6. Start coding! 🚀

## Performance Targets

```
GET /tickets (list)         < 200ms p95
POST /tickets (create)      < 500ms p95
PATCH /tickets/{id}         < 500ms p95
Search 1000 tickets         < 100ms p95
```

## Deployment Checklist

- [ ] Docker images build successfully
- [ ] docker-compose.yml works
- [ ] All tests pass
- [ ] No secrets in environment
- [ ] Database migrations run
- [ ] Health checks pass
- [ ] API responds correctly
- [ ] UI loads correctly

---

**Remember**: If something isn't clear, the docs might need improvement — update them!

**Version**: 1.0.0  
**Last Updated**: 2026-09-23
