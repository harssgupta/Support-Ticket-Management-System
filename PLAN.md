# Implementation Plan - Support Ticket Hub v1.0

**Phase 1 - Foundation**: Database, Core APIs, Basic UI  
**Phase 2 - Enhanced Features**: Bulk ops, real-time, reporting  
**Phase 3 - Polish**: Performance, accessibility, deployment  

---

## Phase 1: Foundation (Weeks 1-3)

### Milestone 1.1: Database & Migrations (Day 1-2)

**Deliverables:**
- ✅ Flyway migrations set up
- ✅ Core tables: `users`, `tickets`, `comments`, `ticket_history`, `attachments`
- ✅ Indexes for performance
- ✅ Constraints for state machine

**Tasks:**
```sql
-- V001__init_users_and_roles.sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20) NOT NULL CHECK (role IN ('REQUESTER', 'AGENT', 'MANAGER', 'ADMIN')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- V002__init_tickets_and_comments.sql
CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  reporter_id BIGINT NOT NULL REFERENCES users(id),
  assignee_id BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  version BIGINT DEFAULT 1,
  CONSTRAINT valid_state_transition CHECK (true) -- Enforced at service layer
);

-- V003__init_history_and_attachments.sql
CREATE TABLE ticket_history (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  field_name VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by BIGINT NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_type VARCHAR(50) NOT NULL
);

-- V004__init_indexes.sql
CREATE INDEX idx_tickets_status_priority ON tickets(status, priority);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_history_ticket ON ticket_history(ticket_id);
CREATE INDEX idx_comments_ticket ON comments(ticket_id);
CREATE INDEX idx_comments_author ON comments(author_id);
```

---

### Milestone 1.2: Backend Core APIs (Day 3-6)

**Controllers & Endpoints:**

1. **AuthController**
   - `POST /auth/login` — User login
   - `POST /auth/logout` — User logout
   - `GET /auth/me` — Current user

2. **TicketController**
   - `POST /tickets` — Create ticket
   - `GET /tickets` — List with filters/search
   - `GET /tickets/{id}` — Get details + history
   - `PATCH /tickets/{id}` — Update fields
   - `PATCH /tickets/{id}/status` — Change status (state machine enforced)
   - `DELETE /tickets/{id}` — Soft delete

3. **CommentController**
   - `POST /tickets/{id}/comments` — Add comment
   - `PATCH /tickets/{id}/comments/{commentId}` — Edit
   - `DELETE /tickets/{id}/comments/{commentId}` — Delete

4. **UserController**
   - `GET /users` — List users
   - `GET /users/{id}` — User details

**Service Layer:**
- `TicketService` — CRUD + state machine validation
- `CommentService` — Comment management
- `UserService` — User authentication & authorization
- `JwtTokenService` — Token generation & validation
- `TicketHistoryService` — Immutable history recording

**Domain Models:**
- `Ticket`, `Comment`, `User`, `TicketHistory` entities
- `TicketStatus` enum with validation
- `Priority` enum
- `UserRole` enum

**Test Coverage:**
- State machine: 16 transition pairs (5 valid, 11 invalid)
- Service layer: 80%+ coverage
- Integration tests with Testcontainers PostgreSQL

---

### Milestone 1.3: Frontend Layout & Auth (Day 7-10)

**Pages:**
- `(auth)/login` — Login form
- `(dashboard)/layout` — Main layout with sidebar
- `(dashboard)/dashboard` — Home page

**Components:**
- `Header` — Navigation + user menu
- `Sidebar` — Nav links + filters
- `LoginForm` — Auth form
- `ErrorDialog` — Display backend errors

**Features:**
- Authentication flow (login → JWT → stored in cookies)
- Protected routes (redirect to login if no auth)
- Basic styling with Tailwind + dark mode support
- Error handling & display

**Libraries Setup:**
- TanStack Query for server state
- React Hook Form + Zod for validation
- Radix UI components
- Sonner for toast notifications

---

### Milestone 1.4: Ticket CRUD UI (Day 11-14)

**Pages:**
- `(dashboard)/tickets` — List with filters
- `(dashboard)/tickets/[id]` — Detail view
- `(dashboard)/tickets/create` — Create form

**Components:**
- `TicketCard` — Card in list
- `TicketDetailPanel` — Side panel with metadata
- `TicketForm` — Create/edit form
- `TicketHistory` — Activity timeline
- `CommentList` — Comments section
- `CommentForm` — Add/edit comment

**Features:**
- Create ticket with title, description, priority, assignee
- List tickets with pagination (20 per page)
- Search by keyword
- Filter by status, priority, assignee
- View full ticket details
- Add/edit comments
- Update ticket fields
- Display validation errors

---

## Phase 2: Enhanced Features (Weeks 4-5)

### Milestone 2.1: State Machine UI (Day 15-16)

**Components:**
- `StatusTransitionDialog` — Dropdown for valid transitions
- `StatusTimeline` — Visual flow diagram showing current + past
- `StatusBadge` — Color-coded status indicator

**Features:**
- Disable invalid transitions in UI
- Show allowed transitions only
- Display timestamps for each transition
- Store transition reason (optional)

---

### Milestone 2.2: Bulk Operations (Day 17-18)

**Features:**
- Select multiple tickets (checkboxes)
- Bulk assign
- Bulk status change
- Bulk delete
- Bulk export (CSV)

---

### Milestone 2.3: Dashboard & Analytics (Day 19-20)

**Pages:**
- `(dashboard)/assigned-to-me` — Personal workload
- `(dashboard)/analytics` — Team metrics

**Components:**
- `TicketSummary` — Total, open, in-progress counts
- `TeamPerformance` — Agent stats
- `SLACompliance` — Metric display

---

## Phase 3: Polish (Weeks 6)

### Milestone 3.1: Performance Optimization

- Query optimization (N+1 prevention)
- Index tuning
- Frontend code splitting
- Image lazy loading
- Caching strategies

### Milestone 3.2: Accessibility & Mobile

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader testing
- Responsive mobile layout
- Touch-friendly buttons

### Milestone 3.3: Testing & QA

- E2E tests with Playwright (critical flows)
- Coverage report & gap analysis
- Performance testing (load testing)
- Security audit

### Milestone 3.4: Deployment

- Docker images built & tested
- docker-compose.yml finalized
- Environment configuration validated
- Documentation complete

---

## Implementation Order

### Priority 1 (Must Have)
1. ✅ Database schema (migrations)
2. ✅ Ticket CRUD APIs + state machine validation
3. ✅ User authentication (login, JWT)
4. ✅ Comment APIs
5. ✅ Basic ticket listing UI
6. ✅ Ticket detail view
7. ✅ Create/edit forms
8. ✅ Search & filter

### Priority 2 (Should Have)
9. ✅ Status transition UI (state machine)
10. ✅ Dashboard (my tickets)
11. ✅ Bulk operations
12. ✅ File attachments
13. ✅ Team analytics
14. ✅ Dark mode

### Priority 3 (Nice to Have)
15. ⏱️ Real-time notifications (WebSocket)
16. ⏱️ Advanced reporting
17. ⏱️ Integrations (email, Slack, webhooks)
18. ⏱️ Undo capability
19. ⏱️ Custom workflows

---

## Testing Strategy by Phase

**Phase 1:**
- Unit tests for all services
- Integration tests for APIs (Testcontainers)
- State machine transition tests (all 16 pairs)
- Component tests for forms

**Phase 2:**
- E2E tests for critical flows (Playwright)
- Performance benchmarks
- Load testing

**Phase 3:**
- Accessibility testing (axe, manual)
- Security review
- Final E2E suite

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| State machine bugs | HIGH | Exhaustive transition tests (16 pairs) |
| Concurrent edits lost | HIGH | Optimistic locking + test for conflicts |
| Secret in git | CRITICAL | Gitleaks pre-commit hook + CI scan |
| N+1 queries | MEDIUM | Query analysis + integration tests |
| Frontend-backend mismatch | MEDIUM | OpenAPI spec + contract tests |
| Accessibility missed | MEDIUM | Automated (axe) + manual testing |

---

## Success Criteria

✅ All CRUD operations functional  
✅ State machine strictly enforced (16/16 transitions validated)  
✅ Search & filtering works  
✅ Comments & collaboration enabled  
✅ 80%+ backend test coverage  
✅ E2E tests for critical flows pass  
✅ WCAG 2.1 AA compliance  
✅ Docker & docker-compose working  
✅ Documentation complete (specs + API + README)  
✅ No secrets in git  
✅ CI/CD pipeline green  

---

## Timeline Summary

| Week | Phase | Milestone | Status |
|------|-------|-----------|--------|
| 1 | 1 | Database, Core APIs | →
| 2 | 1 | Frontend Layout, Auth, CRUD UI | →
| 3 | 1 | Testing, Documentation | →
| 4 | 2 | State Machine UI, Bulk Ops | →
| 5 | 2 | Dashboard, Analytics | →
| 6 | 3 | Optimization, Deployment, QA | →

**Target Launch**: End of Week 6

---

## Notes

- **Spec-Driven**: Every feature starts with spec (requirements → architecture → code)
- **Constitution Compliance**: All commits verify against `CONSTITUTION.md`
- **No Plagiarism**: Code written from scratch, not copied from original project
- **Test-First**: Tests written before or alongside implementation
- **Iterative**: Deploy working features often, gather feedback, iterate

