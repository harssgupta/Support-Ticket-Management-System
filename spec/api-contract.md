# REST API Contract

This describes the API as actually implemented. It replaces an earlier,
more elaborate draft (JWT bearer auth, RFC 9457 error bodies, comment
edit/delete, attachments, `/dashboard/summary`) that was written before
implementation and never updated to match what got built — see
`docs/ai-mistakes-and-fixes.md` and `skills/documentation/README.md`'s
rule against aspirational spec content. If you need any of that
draft's ideas for future work, they belong in `PLAN.md`, not here.

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

No JWT/session was built (explicit scope cut for this exercise). The
frontend sends the current user's ID as a header:

```
X-User-ID: <numeric account id>
```

Mutating endpoints default this to `1` server-side when absent
(`@RequestHeader(required = false, defaultValue = "1")`), so the API
degrades gracefully rather than 401ing — this is not a real
authorization boundary and should not be treated as one in production.

`POST /auth/login` verifies a login name + password (BCrypt) against
`account_holder` and returns the account's id/name/role, which the
frontend stores in `localStorage` and echoes back as `X-User-ID`.

## Error response shape

Every error (`GlobalExceptionHandler`, `@RestControllerAdvice`):

```json
{
  "status": 422,
  "message": "Cannot transition from IN_WORK to NEWLY_OPENED. Allowed transitions: [WITHDRAWN, AWAITING_RESOLUTION]",
  "timestamp": "2026-09-23T23:37:26.509567756+05:30"
}
```

| Status | Cause |
|---|---|
| 400 | Bad input, illegal state (e.g. closing an unassigned issue), DB constraint violation |
| 404 | Entity not found |
| 422 | Invalid state-machine transition specifically |
| 500 | Genuinely unexpected failure |

## Endpoints

### `POST /auth/login`

Request:
```json
{ "loginName": "john", "password": "password123" }
```
Response `200`:
```json
{
  "userId": 1,
  "loginName": "john",
  "displayName": "John Doe",
  "emailAddress": "john@example.com",
  "accountType": "SUPPORT_AGENT"
}
```

### `GET /users`

Lists enabled accounts (used to populate assignee dropdowns).

Response `200`:
```json
[
  { "userId": 1, "loginName": "john", "displayName": "John Doe", "accountType": "SUPPORT_AGENT" }
]
```

### `POST /issues`

Headers: `X-User-ID` (reporter)

Request:
```json
{
  "subjectLine": "Login page bug",
  "problemDescription": "Users cannot log in on Safari",
  "severityLevel": "HIGH",
  "assignedToUserId": 3
}
```
`assignedToUserId` is optional. Response `201`: an `IssueResponse` (see
below). New issues always start in `NEWLY_OPENED`.

### `GET /issues`

Query params (all optional): `searchTerm`, `state`, `severity`, plus
standard Spring `Pageable` params (`page`, `size`, `sort`).

Response `200` is a **Spring `Page<>` wrapper**, not a bare array:
```json
{
  "content": [ { /* IssueResponse */ } ],
  "totalElements": 6,
  "totalPages": 1,
  "number": 0,
  "size": 100,
  "first": true,
  "last": true
}
```
Every frontend consumer reads `.content`.

### `GET /issues/{issueId}`

Response `200`: an `IssueResponse`. `404` if not found.

### `PATCH /issues/{issueId}`

Headers: `X-User-ID`

Request (all fields required — this is a full-field replace despite the
PATCH verb):
```json
{
  "subjectLine": "...",
  "problemDescription": "...",
  "severityLevel": "MODERATE",
  "assignedToUserId": 3
}
```
`400` if the issue is in a non-modifiable state (`CLOSURE`/`WITHDRAWN`).

### `PATCH /issues/{issueId}/state`

Headers: `X-User-ID` (recorded as who made the change)

Request:
```json
{ "targetState": "IN_WORK", "transitionReason": null }
```
`200` on success. `422` on an invalid transition (see
`spec/state-machine.md`). `400` if transitioning to `CLOSURE` on an
unassigned issue.

### `GET /issues/{issueId}/messages`

Response `200`: a plain array (not paginated) of:
```json
[
  {
    "msgId": 1,
    "issueId": 1,
    "authorUserId": 1,
    "authorName": "John Doe",
    "messageText": "...",
    "parentMsgId": null,
    "postedAt": "...",
    "updatedAt": "..."
  }
]
```

### `POST /issues/{issueId}/messages`

Headers: `X-User-ID` (author)

Request:
```json
{ "messageText": "Looking into this now", "parentMessageId": null }
```
Response `201`: the created message (same shape as above). `parentMessageId`
enables threaded replies.

## `IssueResponse` shape

Returned by create/get/update/state-transition:

```json
{
  "issueId": 1,
  "issueKey": "ISS-1001",
  "subjectLine": "...",
  "problemDescription": "...",
  "severityLevel": "MODERATE",
  "currentState": "IN_WORK",
  "reporterName": "John Doe",
  "assignedToName": "Sarah Connor",
  "messageCount": 0,
  "createdAt": "2026-09-23T15:13:20Z",
  "lastModifiedAt": "2026-09-23T20:43:27.083358288+05:30",
  "concurrencyVersion": 1
}
```

Note: `reporterName`/`assignedToName` are the only identity fields
returned — there is no `reportingUserId`/`assignedToUserId` in this
response (see `docs/ai-mistakes-and-fixes.md` #5 for what happens when a
frontend consumer assumes otherwise). `messageCount` is currently always
`0` — it's a known stub, not wired to the real count yet.

## CORS

`Access-Control-Allow-Origin` matches any `http://localhost:*` or
`http://127.0.0.1:*` origin (pattern-based, not a single hardcoded port —
see `docs/ai-mistakes-and-fixes.md` #6).
