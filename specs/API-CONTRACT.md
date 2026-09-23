# REST API Contract (OpenAPI 3.0)

## Base URL
```
http://localhost:8080/api/v1
```

## Authentication
All endpoints require authentication via JWT bearer token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

Public endpoints: `POST /auth/login`, `GET /health`

## Response Format (RFC 9457 Problem Details)

### Success Response (2xx)
```json
{
  "data": { /* response body */ },
  "meta": {
    "timestamp": "2026-09-23T10:00:00Z",
    "requestId": "req-12345-abcde"
  }
}
```

### Error Response
```json
{
  "type": "https://api.supportticket.hub/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The ticket could not be created due to validation errors",
  "code": "VALIDATION_ERROR",
  "instance": "/api/v1/tickets",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "priority",
      "message": "Invalid priority value"
    }
  ],
  "requestId": "req-12345-abcde"
}
```

## API Endpoints

### Authentication

#### POST /auth/login
Create session with credentials.

**Request:**
```json
{
  "username": "john",
  "password": "secretpassword"
}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "fullName": "John Doe",
  "role": "AGENT"
}
```

**Cookies Set:**
- `auth_token`: HttpOnly, SameSite=Strict, Secure
- `csrf_token`: SameSite=Strict (visible to JS for CSRF protection)

---

### Tickets

#### POST /tickets
Create a new ticket.

**Headers:**
```
X-CSRF-Token: <token>
```

**Request:**
```json
{
  "title": "Login page not loading",
  "description": "Users report blank page on login",
  "priority": "CRITICAL",
  "assigneeId": 2
}
```

**Response (201):**
```json
{
  "id": 123,
  "key": "TKT-100",
  "title": "Login page not loading",
  "description": "Users report blank page on login",
  "status": "OPEN",
  "priority": "CRITICAL",
  "reporter": { "id": 1, "username": "john", "fullName": "John Doe" },
  "assignee": { "id": 2, "username": "jane", "fullName": "Jane Smith" },
  "createdAt": "2026-09-23T10:00:00Z",
  "updatedAt": "2026-09-23T10:00:00Z",
  "comments": [],
  "attachments": [],
  "version": 1
}
```

---

#### GET /tickets
List tickets with filtering, sorting, and pagination.

**Query Parameters:**
```
page=1                          # Default 1
pageSize=20                     # Default 20, max 100
status=OPEN,IN_PROGRESS         # Comma-separated values
priority=CRITICAL,HIGH          # Comma-separated values
assigneeId=1,2                  # Comma-separated user IDs
reporterId=1                    # Filter by reporter
search=login                    # Full-text search across title, description, comments
sortBy=createdAt,status         # Fields to sort
sortDirection=desc,asc          # Direction for each sort field
view=assigned                   # Special view: 'assigned' shows REQUESTER's own tickets + assigned to them
dateFrom=2026-09-01             # ISO 8601 date filter
dateTo=2026-09-30
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 123,
      "key": "TKT-100",
      "title": "Login page not loading",
      "status": "OPEN",
      "priority": "CRITICAL",
      "reporter": { "id": 1, "username": "john" },
      "assignee": { "id": 2, "username": "jane" },
      "commentCount": 3,
      "createdAt": "2026-09-23T10:00:00Z",
      "updatedAt": "2026-09-23T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalElements": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

#### GET /tickets/{id}
Get ticket details with full history.

**Response (200):**
```json
{
  "id": 123,
  "key": "TKT-100",
  "title": "Login page not loading",
  "description": "Users report blank page on login",
  "status": "IN_PROGRESS",
  "priority": "CRITICAL",
  "reporter": { "id": 1, "username": "john", "fullName": "John Doe" },
  "assignee": { "id": 2, "username": "jane", "fullName": "Jane Smith" },
  "watchers": [ { "id": 3, "username": "bob" } ],
  "createdAt": "2026-09-23T10:00:00Z",
  "updatedAt": "2026-09-23T10:05:00Z",
  "firstResponseAt": "2026-09-23T10:02:00Z",
  "resolvedAt": null,
  "comments": [
    {
      "id": 456,
      "author": { "id": 2, "username": "jane" },
      "content": "Assigned to myself to investigate",
      "createdAt": "2026-09-23T10:02:00Z",
      "updatedAt": "2026-09-23T10:02:00Z",
      "mentions": ["bob"],
      "replies": []
    }
  ],
  "attachments": [
    {
      "id": 789,
      "fileName": "error-screenshot.png",
      "fileUrl": "https://cdn.example.com/attachments/789",
      "fileSize": 204800,
      "mimeType": "image/png",
      "uploadedBy": { "id": 2, "username": "jane" },
      "uploadedAt": "2026-09-23T10:03:00Z"
    }
  ],
  "history": [
    {
      "id": 1,
      "fieldName": "status",
      "oldValue": "OPEN",
      "newValue": "IN_PROGRESS",
      "changedBy": { "id": 2, "username": "jane" },
      "changedAt": "2026-09-23T10:00:30Z",
      "changeType": "STATUS_CHANGE"
    },
    {
      "id": 2,
      "fieldName": "assignee",
      "oldValue": null,
      "newValue": "jane",
      "changedBy": { "id": 2, "username": "jane" },
      "changedAt": "2026-09-23T10:00:30Z",
      "changeType": "ASSIGNMENT"
    }
  ],
  "version": 2
}
```

---

#### PATCH /tickets/{id}
Update ticket fields.

**Headers:**
```
If-Match: <version_from_get_response>
X-CSRF-Token: <token>
```

**Request:**
```json
{
  "title": "Updated title (optional)",
  "description": "Updated description (optional)",
  "priority": "HIGH",
  "assigneeId": 3
}
```

**Response (200):** Updated ticket (same as GET)

**Error (409 Conflict):** Version mismatch (optimistic locking)
```json
{
  "status": 409,
  "code": "VERSION_MISMATCH",
  "detail": "This ticket was modified. Please refresh and try again.",
  "currentVersion": 3
}
```

---

#### PATCH /tickets/{id}/status
Change ticket status (enforces state machine).

**Headers:**
```
If-Match: <version>
X-CSRF-Token: <token>
```

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "reason": "Starting investigation (optional)"
}
```

**Response (200):** Updated ticket

**Error (422 Unprocessable Entity):** Invalid transition
```json
{
  "status": 422,
  "code": "INVALID_STATUS_TRANSITION",
  "detail": "Cannot transition from CLOSED to OPEN",
  "allowedTransitions": ["OPEN", "IN_PROGRESS"]
}
```

---

### Comments

#### POST /tickets/{id}/comments
Add comment to ticket.

**Headers:**
```
X-CSRF-Token: <token>
```

**Request:**
```json
{
  "content": "Investigating the issue. @jane please check the logs.",
  "parentCommentId": null
}
```

**Response (201):**
```json
{
  "id": 456,
  "ticket": { "id": 123, "key": "TKT-100" },
  "author": { "id": 1, "username": "john" },
  "content": "Investigating the issue. @jane please check the logs.",
  "mentions": ["jane"],
  "replies": [],
  "attachments": [],
  "createdAt": "2026-09-23T10:05:00Z",
  "updatedAt": "2026-09-23T10:05:00Z",
  "version": 1
}
```

---

#### PATCH /tickets/{id}/comments/{commentId}
Update comment.

**Headers:**
```
If-Match: <version>
X-CSRF-Token: <token>
```

**Request:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):** Updated comment

---

#### DELETE /tickets/{id}/comments/{commentId}
Delete comment.

**Headers:**
```
X-CSRF-Token: <token>
```

**Response (204 No Content)**

---

### Attachments

#### POST /tickets/{id}/attachments
Upload file attachment.

**Form Data:**
```
file: <multipart file, max 10MB>
```

**Response (201):**
```json
{
  "id": 789,
  "fileName": "screenshot.png",
  "fileUrl": "https://cdn.example.com/attachments/789",
  "fileSize": 204800,
  "mimeType": "image/png",
  "uploadedBy": { "id": 1, "username": "john" },
  "uploadedAt": "2026-09-23T10:05:00Z"
}
```

---

#### DELETE /tickets/{id}/attachments/{attachmentId}
Delete attachment.

**Response (204 No Content)**

---

### Users

#### GET /users
Get all active users.

**Query Parameters:**
```
search=jane                 # Search by username or fullName
role=AGENT,MANAGER          # Filter by role
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 2,
      "username": "jane",
      "email": "jane@example.com",
      "fullName": "Jane Smith",
      "role": "AGENT"
    }
  ]
}
```

---

#### GET /users/me
Get current authenticated user.

**Response (200):** Current user object

---

### Dashboard

#### GET /dashboard/summary
Get ticket summary for dashboard.

**Response (200):**
```json
{
  "totalTickets": 156,
  "openTickets": 45,
  "inProgressTickets": 23,
  "assignedToMe": 12,
  "avgResolutionTime": 3600,
  "avgResponseTime": 1800,
  "slaCompliance": 0.96,
  "recentTickets": [ /* latest 5 tickets */ ],
  "teamPerformance": {
    "topAgent": { "username": "jane", "resolvedCount": 156 },
    "avgTicketsPerAgent": 23.4
  }
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VERSION_MISMATCH | 409 | Optimistic lock conflict |
| INVALID_STATUS_TRANSITION | 422 | State machine violation |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

---

## Rate Limiting
- 100 requests per minute per user (read)
- 20 requests per minute per user (write)
- Returns `429 Too Many Requests` when exceeded
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Pagination
- Default page size: 20
- Maximum page size: 100
- Total elements and page count included in response
- Cursor-based pagination available for large datasets: `?cursor=abc123`

---

## Sorting
- Multiple sort fields supported: `sortBy=status,createdAt`
- Corresponding directions: `sortDirection=asc,desc`
- Default: `createdAt desc` (newest first)

---

## Search
- Full-text search across multiple fields
- Supports boolean operators: AND, OR, NOT
- Example: `search=login AND error`
- Indexed for performance (< 100ms p95)
