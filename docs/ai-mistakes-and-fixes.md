# AI Mistakes & Fixes

This is a running, honest record of mistakes the AI assistant (Claude)
made while building this project, how they were caught, and how they
were fixed. It exists because the assignment explicitly requires
demonstrating that AI output was validated and corrected, not accepted
blindly — and because it's genuinely useful engineering history.

Ordered roughly by severity/impact, not chronologically.

---

## 1. Next.js route group naming — the big one

**What happened:** The dashboard pages were placed under a folder named
`(dashboard)`. In Next.js App Router, parentheses mark a *route group* —
a folder that organizes files without adding a URL segment. So
`(dashboard)/page.tsx` resolved to `/`, and `(dashboard)/issues/page.tsx`
resolved to `/issues` — **not** `/dashboard` and `/dashboard/issues`.
Every link, redirect, and `router.push()` call in the entire app pointed
to `/dashboard/...`.

**Impact:** Every dashboard page 404'd. This was misdiagnosed multiple
times in a row as a build-cache problem — several rounds of "clear
`.next`, restart the dev server" were tried and reported as fixes before
the actual cause was found by directly inspecting the folder structure.

**Fix:** Renamed `(dashboard)` → `dashboard`. One-line diagnosis once
actually looked for, but it cost several back-and-forth cycles because
the earlier hypotheses (cache, missing files) were plausible-sounding
and wrong.

**Lesson:** When the same category of error persists across multiple
"fixes," stop patching symptoms and re-derive the routing/structure from
scratch instead of iterating on the previous guess.

---

## 2. No `SecurityConfig` — every endpoint silently locked

**What happened:** `spring-boot-starter-security` was on the classpath
(inherited from the original pom.xml) but no `SecurityFilterChain` bean
was ever defined. Spring Boot's default behavior in that situation is to
auto-generate a random password at startup and require HTTP Basic auth
on *every* endpoint.

**Impact:** Every single API call from the frontend would have failed —
this wasn't caught until actually exercising login end-to-end, well
after a lot of other UI work had already been built on the assumption
that the API was reachable.

**Fix:** Added an explicit `SecurityConfig` with `permitAll()` (this
project uses simple `X-User-ID` header auth, no JWT — a deliberate scope
cut, not a real auth system) and a CORS configuration source.

**Lesson:** A dependency being present is not the same as it being
configured. Should have verified an unauthenticated `curl` call worked
before building UI on top of the assumption that it would.

---

## 3. `searchIssues` — NULL in SQL is not what you think

**What happened:**
```sql
WHERE LOWER(i.subjectLine) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
```
with no guard for `searchTerm` being `null`. In SQL, `CONCAT(x, NULL, y)`
evaluates to `NULL`, and `anything LIKE NULL` is never `true` — it's
`NULL`, which a `WHERE` clause treats as false. Since the frontend's
normal "list all tickets" call sends no search term at all, this query
matched **zero rows, always**, regardless of how many tickets existed.

**Impact:** Creating a ticket worked (different code path), but the list
and dashboard pages always showed empty — a confusing pair of symptoms
that looked like two unrelated bugs ("saving but not listing") until the
actual single root cause was traced to this one query.

**Fix:** Added the same `(:searchTerm IS NULL OR ...)` guard already
used for the `:state` and `:severity` parameters in the same query —
this pattern existed two lines away in the same `@Query` and simply
wasn't applied consistently to all three parameters the first time.

**Lesson:** When one parameter in a query has a null-guard and others
don't, that's a strong signal to check *why* — the inconsistency itself
was the tell.

---

## 4. Business rule enforced only at the DB layer → raw 500

**What happened:** A migration-level `CHECK` constraint required an
issue to have an assignee before it could reach `CLOSURE`. No equivalent
check existed in the service layer. Additionally — a bigger miss — there
was no UI path to assign anyone to a ticket at all (create form had no
assignee field, detail page had no assign action), so the constraint was
essentially unreachable-but-guaranteed to fire the moment anyone tried
the natural next step of closing a resolved ticket.

**Impact:** Attempting to close an unassigned ticket crashed with a raw
Hibernate "could not execute statement [Check constraint...]" 500 error
surfaced directly to the browser console — not a clean validation
message, and with no way to fix it from the UI at that point in the
build.

**Fix:** Added an explicit service-layer check (`IllegalStateException`
with a clear message) before the DB is touched, a
`DataIntegrityViolationException` handler as a general safety net, and —
the actually load-bearing fix — an assignee dropdown on both the create
form and the issue detail page so the rule is satisfiable through the UI
at all.

**Lesson:** A DB constraint is a backstop, not a substitute for
service-layer validation with a human-readable message. And a business
rule isn't "done" until there's a UI path that can satisfy it.

---

## 5. Frontend/backend field-name mismatch (silent, not a crash)

**What happened:** The frontend's `Issue` TypeScript interface declared
`reportingUserId` and `assignedToUserId` (expecting numeric IDs). The
actual backend `IssueResponse` DTO only ever returns `reporterName` and
`assignedToName` (strings) — the numeric ID fields don't exist in the
API response at all.

**Impact:** This did **not** throw an error. `issue.reportingUserId` was
simply `undefined`, and the UI silently rendered "Reporter: User #"
(blank) and always showed "Unassigned" regardless of the real assignment
state. This is worse than a crash — it looked like working UI with wrong
data, and went unnoticed until a screenshot was specifically inspected
field-by-field.

**Fix:** Corrected the interface to match the actual DTO shape
(`reporterName`/`assignedToName`), same fix applied to comment authors
(`authorUserId` → `authorName`).

**Lesson:** When frontend and backend are built somewhat independently
(as happened here — the API response shape evolved after the frontend
types were first written), the contract needs to be re-verified against
the actual running response, not just assumed to match the original
plan. A `curl` of the real endpoint would have caught this in seconds.

---

## 6. CORS allow-list of exactly one hardcoded origin

**What happened:** `SecurityConfig` initially set
`setAllowedOrigins(List.of("http://localhost:3000"))`. The Next.js dev
server picks the next free port when its default is taken — it landed on
`3001` — and the browser rejected every request as a CORS failure.

**Fix:** Switched to `setAllowedOriginPatterns("http://localhost:*", ...)`.

**Lesson:** A dev-server port is not a stable assumption to hardcode
against, even within a single machine's single session.

---

## 7. Missing pieces that made features silently unreachable

Several features were fully built on one side (frontend or service
layer) with no controller/route to reach them from the other side:

- **`MessageController` didn't exist.** The comments feature had a
  complete frontend (form + list) and a complete
  `MessageManagementService`, but no `@RestController` ever exposed
  `GET/POST /issues/{id}/messages`.
- **`AuthController` didn't exist.** The login page called
  `/auth/login` from the very first version of the frontend; that route
  was never implemented until much later, when login was specifically
  debugged end-to-end for the first time.
- **No seed data.** Even once `AuthController` existed, there were no
  user rows in the database at all — login had nobody to authenticate
  against until a seed migration was added.

**Lesson:** "The service layer has a method for this" is not the same as
"this feature works." Each of these was assumed complete because half of
the stack was built convincingly.

---

## 8. Build/dependency mistakes (caught by the build failing, at least)

These were self-evident from compiler/build errors rather than requiring
manual discovery, but are worth recording because each one blocked
progress and needed a real fix, not a retry:

- Used artifact `mysql-connector-java` (no longer published for the
  version requested) instead of the current `mysql-connector-j`.
- Included `flyway-database-postgresql` after switching the whole stack
  to MySQL — Flyway then refused to recognize MySQL 8.0 as a supported
  database at all until the matching `flyway-mysql` module was swapped
  in.
- A test file referenced `IssueSeverity.MEDIUM`, an enum constant that
  doesn't exist (the real values are TRIVIAL/LOW/MODERATE/HIGH/CRITICAL)
  — a copy-paste-shaped naming mismatch from an earlier draft.
- `IssueMessageRepository.findByParentMessageIsNull(Issue issue)` — the
  Spring Data method *name* implies a zero-parameter derived query, but
  it was declared with one parameter, so Spring Data JPA failed at
  startup trying to bind a parameter the query-derivation logic never
  expected. Renamed to `findByIssueAndParentMessageIsNull(Issue issue)`
  to match what the method actually needs to do.
- A duplicate Next.js dynamic-route folder existed as both `[id]` and
  the literal, escaped `\[id\]` — two folders for what should have been
  one route — causing a "Requested and resolved page mismatch" error.
- The root `layout.tsx` (required by Next.js App Router to provide
  `<html>`/`<body>`) and `globals.css` were never created at all in the
  first pass.
- `postcss.config.js` was missing entirely, so Tailwind never processed
  any CSS regardless of what was in `globals.css` or the Tailwind config.
- Tailwind v4 moved its PostCSS plugin to a separate `@tailwindcss/postcss`
  package; the initial config referenced the old `tailwindcss` plugin
  name directly, which v4 explicitly rejects with a build error naming
  the fix.

**Lesson:** Most of these are "this exact version of this exact tool
changed something" class mistakes — they're individually minor but
numerous, and the pattern (assuming an older/different tool's API without
checking the installed version) repeated enough times to be worth naming
as a category, not just a one-off.

---

## 9. Debugging against the wrong running process

**What happened:** During iterative backend fixes, old `java -jar ...`
processes sometimes survived a `pkill` (or a new instance failed to bind
port 8080 because the old one hadn't actually died yet), and a `curl`
"verification" would succeed against whichever process was actually
listening — which was not always the newly rebuilt one. This led to at
least one round of reporting a fix as verified when the user's browser
was, in fact, still talking to the pre-fix backend.

**Fix:** Started explicitly checking the exact PID (`ps -p $PID`) after
every restart instead of trusting that a `kill` + `start` sequence
completed as intended, and cross-checking timestamps in the running
backend's own log output against wall-clock time.

**Lesson:** "I restarted it and it works" needs the restart itself
verified (right PID, right port, right binary timestamp) before trusting
the "it works" part — especially in a session with many rapid
edit-rebuild-restart cycles.

---

## 10. In-memory ticket-key counter, reset by every restart

**What happened:** `generateIssueKey()` built ticket keys (`ISS-1001`,
`ISS-1002`, ...) from a `private static final AtomicLong
issueKeyCounter = new AtomicLong(1000)`. That field re-initializes to
`1000` every time the JVM starts. The database, meanwhile, keeps every
`issue_key` ever created across all previous runs, and the column has a
`UNIQUE` constraint.

**Impact:** After enough backend restarts within one session (this
project restarted the backend a lot, chasing other fixes), the counter
inevitably regenerated a key — `ISS-1001` — that already existed from a
prior run. The very next "create issue" hit a unique-constraint
violation and surfaced as a generic, unhelpful "This operation violates
a data constraint and cannot be completed" — the `DataIntegrityViolationException`
safety-net message added for mistake #4 correctly caught the crash and
kept it off the user's screen as a raw 500, but a generic safety net
can't explain *why* a specific constraint fired, only that one did.

**Fix:** The counter is now seeded from the database at construction
time (`1000 + issueRepository.count()`) instead of a fixed literal, so
each restart continues numbering from where the data actually left off.

**Lesson:** An in-memory counter is not a substitute for a
database-backed sequence when the thing it's numbering is itself
persistent — any state that's supposed to survive a restart needs to
actually be read back from what's durable (the database), not
re-initialized to a constant and hoped to stay in sync.

---

## 11. Dead/hardcoded UI left in a "working" app

Several UI elements were shipped non-functional and only caught because
the user clicked them:

- A settings (gear) icon in the header linked to nothing.
- A search box in the header didn't do anything on Enter or otherwise.
- The sidebar footer hardcoded "John Doe / Admin" regardless of which
  account was actually logged in.
- A "Demo Credentials" box (showing a real username/password) was left
  visible directly on the login screen — fine for local development,
  not something that should ship as UI copy.

**Fix:** Wired the search box to navigate to a filtered issues view,
built a real `/dashboard/settings` page, made the sidebar read the
actual logged-in user from `localStorage`, and removed the credentials
box (credentials were instead given directly to the user out-of-band,
never stored in the app).

**Lesson:** A page rendering without errors is not the same as every
interactive element on it doing something. These needed to be manually
clicked to find, and were not something a build/compile/test pass would
ever catch on their own.
