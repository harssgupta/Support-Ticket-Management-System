# System Architecture

## Overview Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Browser)                   │
│  Next.js 15 (React 19) + TypeScript + Tailwind + Radix UI  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway / Middleware                   │
│         CORS, Rate Limiting, Request/Response Logging       │
└────────────────────────┬────────────────────────────────────┘
                         │ /api/* proxy
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend (Java 21 + Spring Boot 3.5)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ REST Controllers (API Layer)                         │  │
│  │  - TicketController, CommentController, etc.        │  │
│  └──────────────┬───────────────────────────────────────┘  │
│  ┌──────────────↓───────────────────────────────────────┐  │
│  │ Service Layer (Business Logic)                       │  │
│  │  - TicketService, CommentService, UserService       │  │
│  │  - State Machine Validator                          │  │
│  └──────────────┬───────────────────────────────────────┘  │
│  ┌──────────────↓───────────────────────────────────────┐  │
│  │ Repository Layer (Data Access)                       │  │
│  │  - TicketRepository, CommentRepository, etc.        │  │
│  │  - Custom queries for search & filtering            │  │
│  └──────────────┬───────────────────────────────────────┘  │
│  ┌──────────────↓───────────────────────────────────────┐  │
│  │ Domain Models (Entities)                            │  │
│  │  - Ticket, Comment, TicketHistory, User            │  │
│  └──────────────┬───────────────────────────────────────┘  │
└────────────────┬──────────────────────────────────────────┘
                 │ JDBC
                 ↓
┌─────────────────────────────────────────────────────────────┐
│          PostgreSQL 16 (Primary Data Store)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tables: tickets, comments, ticket_history,          │  │
│  │         users, roles, attachments, search_index     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Backend Package Structure (Package-by-Feature)

```
src/main/java/com/supportticket/
├── common/
│   ├── config/          # Global configuration
│   ├── exception/       # Global exceptions & handlers
│   ├── util/            # Utility classes
│   └── security/        # JWT, CORS, CSRF
├── ticket/
│   ├── api/            # TicketController, DTOs
│   ├── service/        # TicketService, business logic
│   ├── repository/     # TicketRepository, queries
│   ├── entity/         # Ticket, TicketHistory entities
│   ├── event/          # Domain events
│   └── validation/     # State machine validator
├── comment/
│   ├── api/            # CommentController, DTOs
│   ├── service/        # CommentService
│   ├── repository/     # CommentRepository
│   └── entity/         # Comment entity
├── user/
│   ├── api/            # UserController, DTOs
│   ├── service/        # UserService, authentication
│   ├── repository/     # UserRepository
│   └── entity/         # User, Role entities
├── auth/
│   ├── jwt/            # JWT generation/validation
│   ├── controller/     # LoginController
│   └── filter/         # JwtAuthenticationFilter
└── attachment/
    ├── service/        # File upload/download logic
    └── entity/         # Attachment entity
```

## Frontend Structure

```
frontend/
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # Dashboard & main pages
│   │   └── layout.tsx     # Root layout
│   ├── components/
│   │   ├── ui/            # Radix UI wrapped components
│   │   ├── tickets/       # Ticket-related components
│   │   ├── comments/      # Comment components
│   │   └── common/        # Reusable components
│   ├── lib/
│   │   ├── api/           # API client generation
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── validators/    # Form validators
│   ├── stores/            # Zustand state management
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
└── tests/                  # Vitest & Playwright tests
```

## Database Schema Highlights

```sql
-- Core tables
tickets (id, key, title, description, status, priority, created_at, updated_at, version)
comments (id, ticket_id, author_id, content, created_at, updated_at)
ticket_history (id, ticket_id, field_name, old_value, new_value, changed_by, changed_at)
users (id, username, email, password_hash, role, created_at)
attachments (id, ticket_id, file_url, file_name, file_size, uploaded_at)

-- Indexes for performance
CREATE INDEX idx_tickets_status_priority ON tickets(status, priority);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_comments_ticket ON comments(ticket_id);
CREATE INDEX idx_history_ticket ON ticket_history(ticket_id);
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials (login endpoint)
2. Backend validates and creates JWT
3. JWT sent as HttpOnly, SameSite=Strict cookie
4. Subsequent requests use cookie automatically
5. CSRF token required for state-changing operations
6. Token validated on each request
```

### Authorization Model
- Role-based access control (RBAC)
- Object-level checks (user can only see their tickets)
- Service layer enforces permissions
- Database constraints back up business rules

## Data Flow Example: Update Ticket Status

```
Frontend:
  1. User clicks "Mark as In Progress" button
  2. UI validates state transition
  3. Sends PATCH /api/v1/tickets/{id}/status with ETag header
  
Backend:
  4. JwtFilter validates token
  5. Controller validates current status
  6. Service enforces state machine rules
  7. Repository updates with optimistic locking
  8. New TicketHistory row created (immutable)
  9. Returns 200 with updated ticket + new ETag
  
Frontend:
  10. UI updates optimistically
  11. Displays success notification
  12. Updates activity feed in real-time
```

## Caching Strategy

- **Query Results**: Redis for frequently accessed lists
- **User Sessions**: In-memory with distributed mode support
- **Search Index**: Full-text search via PostgreSQL tsearch
- **Frontend**: React Query for client-side caching

## Deployment Architecture

```
┌─────────────────────────────────┐
│   Docker Compose (Local Dev)    │
│  - Frontend Container           │
│  - Backend Container            │
│  - PostgreSQL Container         │
│  - Redis Container (optional)   │
└─────────────────────────────────┘
         ↓ (for production)
┌─────────────────────────────────┐
│  Kubernetes / Cloud Platform    │
│  - Frontend deployment          │
│  - Backend deployment           │
│  - Managed PostgreSQL           │
│  - Redis cluster                │
│  - Load balancer                │
└─────────────────────────────────┘
```

## Technology Stack Justification

| Layer | Tech | Reason |
|-------|------|--------|
| **Runtime** | Java 21 LTS | Long-term support, modern features (records, pattern matching) |
| **Framework** | Spring Boot 3.5 | Mature, battle-tested, excellent security & data access |
| **Database** | PostgreSQL 16 | ACID compliance, full-text search, JSON support |
| **Frontend** | Next.js 15 | Server components, built-in optimization, React 19 support |
| **UI Components** | Radix UI | Accessible, unstyled, composable |
| **Styling** | Tailwind v4 | Utility-first, high productivity |
| **Query** | TanStack Query v5 | Server state management, caching, synchronization |
| **Testing** | JUnit 5 + Testcontainers | Comprehensive integration testing with real DB |
