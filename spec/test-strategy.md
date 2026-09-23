# Testing Strategy & Quality Gates

## Testing Pyramid

```
                    ╱╲
                   ╱  ╲       E2E Tests (5-10%)
                  ╱    ╲      - Playwright
                 ╱──────╲     - Critical user journeys
                ╱────────╲
               ╱          ╲    Integration Tests (25-30%)
              ╱            ╲   - Testcontainers PostgreSQL
             ╱──────────────╲  - API endpoints
            ╱                ╲ - State machine validation
           ╱            ╱────╲
          ╱      ╱─────╱      ╲  Unit Tests (60-65%)
         ╱  ╱───╱             ╲ - Service layer
        ╱_╱___╱────────────────╲ - Validators
       ╱_________________________╲ - Utilities
```

---

## Backend Testing

### Unit Tests (JUnit 5 + Mockito)

**Coverage Target**: 80% for service and domain layers

#### Test Suites

**1. State Machine Tests**
```java
@DisplayName("TicketStatusTransitionValidator")
class TicketStatusTransitionValidatorTest {
    
    @Test
    @DisplayName("should allow OPEN to IN_PROGRESS transition")
    void testValidTransition_OpenToInProgress() {
        TicketStatus from = TicketStatus.OPEN;
        TicketStatus to = TicketStatus.IN_PROGRESS;
        
        assertTrue(from.canTransitionTo(to));
    }
    
    @Test
    @DisplayName("should reject CLOSED to OPEN transition")
    void testInvalidTransition_ClosedToOpen() {
        TicketStatus from = TicketStatus.CLOSED;
        TicketStatus to = TicketStatus.OPEN;
        
        assertFalse(from.canTransitionTo(to));
    }
    
    @ParameterizedTest
    @CsvSource({
        "OPEN,IN_PROGRESS",
        "OPEN,CANCELLED",
        "IN_PROGRESS,RESOLVED",
        "IN_PROGRESS,CANCELLED",
        "RESOLVED,CLOSED"
    })
    @DisplayName("should allow all valid transitions")
    void testAllValidTransitions(TicketStatus from, TicketStatus to) {
        assertTrue(from.canTransitionTo(to));
    }
    
    @ParameterizedTest
    @CsvSource({
        "CLOSED,OPEN",
        "CLOSED,IN_PROGRESS",
        "RESOLVED,OPEN",
        "CANCELLED,OPEN"
    })
    @DisplayName("should reject all invalid transitions")
    void testAllInvalidTransitions(TicketStatus from, TicketStatus to) {
        assertFalse(from.canTransitionTo(to));
    }
}
```

**2. Ticket Service Tests**
```java
@DisplayName("TicketService")
class TicketServiceTest {
    
    @Mock TicketRepository ticketRepository;
    @Mock TicketHistoryService historyService;
    @InjectMocks TicketService service;
    
    @Test
    void testCreateTicket_WithValidData() {
        TicketCreateRequest request = new TicketCreateRequest(
            "Test", "Description", Priority.HIGH, 1L
        );
        User reporter = new User(/* ... */);
        
        Ticket ticket = service.createTicket(request, reporter);
        
        assertEquals("Test", ticket.getTitle());
        assertEquals(TicketStatus.OPEN, ticket.getStatus());
        verify(ticketRepository).save(any(Ticket.class));
        verify(historyService).recordCreation(ticket, reporter);
    }
    
    @Test
    void testChangeStatus_ValidTransition() {
        Ticket ticket = new Ticket(/* ... */);
        ticket.setStatus(TicketStatus.OPEN);
        User user = new User(/* ... */);
        
        service.changeStatus(ticket, TicketStatus.IN_PROGRESS, user);
        
        assertEquals(TicketStatus.IN_PROGRESS, ticket.getStatus());
        verify(historyService).recordStatusChange(any(), any(), any());
    }
    
    @Test
    void testChangeStatus_InvalidTransition_ThrowsException() {
        Ticket ticket = new Ticket(/* ... */);
        ticket.setStatus(TicketStatus.CLOSED);
        User user = new User(/* ... */);
        
        assertThrows(InvalidStatusTransitionException.class, () -> {
            service.changeStatus(ticket, TicketStatus.OPEN, user);
        });
    }
}
```

**3. Comment Service Tests**
```java
@DisplayName("CommentService")
class CommentServiceTest {
    
    @Test
    void testAddComment_WithMentions() {
        // Test that @mentions are parsed and extracted
    }
    
    @Test
    void testAddComment_ClosedTicket_Allowed() {
        // Comments should be allowed even on closed tickets
    }
    
    @Test
    void testUpdateComment_NotAuthor_Forbidden() {
        // Only author or admin can update
    }
}
```

### Integration Tests (Testcontainers + PostgreSQL)

**Coverage Target**: 70%+ for repositories and API contracts

#### Test Fixtures
```java
@SpringBootTest
@Container
class TicketIntegrationTestBase {
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
        DockerImageName.parse("postgres:16")
    );
    
    @BeforeEach
    void setUp() {
        // Seed test data
        User reporter = userRepository.save(new User("john", "john@test.com", "..."));
        User assignee = userRepository.save(new User("jane", "jane@test.com", "..."));
    }
}
```

#### State Machine Integration Tests
```java
@DisplayName("TicketTransitionIntegrationTest")
class TicketTransitionIntegrationTest extends TicketIntegrationTestBase {
    
    @Test
    void testAllStatusTransitions_ViaRestEndpoint() throws Exception {
        // Test all 5 valid transitions through HTTP
        for (StatusTransition valid : VALID_TRANSITIONS) {
            testTransition(valid.from, valid.to, true);
        }
        
        // Test all invalid transitions
        for (StatusTransition invalid : INVALID_TRANSITIONS) {
            testTransition(invalid.from, invalid.to, false);
        }
    }
    
    private void testTransition(
        TicketStatus from, 
        TicketStatus to, 
        boolean shouldSucceed
    ) throws Exception {
        Ticket ticket = createTicket(from);
        
        MvcResult result = mockMvc.perform(
            patch("/api/v1/tickets/{id}/status", ticket.getId())
                .contentType(APPLICATION_JSON)
                .header("If-Match", ticket.getVersion())
                .header("X-CSRF-Token", csrfToken)
                .content("""
                    { "status": "%s" }
                    """.formatted(to))
        ).andReturn();
        
        if (shouldSucceed) {
            assertEquals(200, result.getResponse().getStatus());
            Ticket updated = ticketRepository.findById(ticket.getId()).orElseThrow();
            assertEquals(to, updated.getStatus());
        } else {
            assertEquals(422, result.getResponse().getStatus());
            Ticket unchanged = ticketRepository.findById(ticket.getId()).orElseThrow();
            assertEquals(from, unchanged.getStatus());
        }
    }
}
```

#### Search & Filter Integration Tests
```java
@DisplayName("TicketSearchIntegrationTest")
class TicketSearchIntegrationTest extends TicketIntegrationTestBase {
    
    @Test
    void testSearchByKeyword_FullText() {
        seedTickets(10);
        
        List<Ticket> results = ticketService.search("login", null, null);
        
        assertTrue(results.size() > 0);
        assertTrue(results.stream()
            .allMatch(t -> t.getTitle().contains("login") || 
                          t.getDescription().contains("login")));
    }
    
    @Test
    void testFilterByStatus_MultipleValues() {
        seedTickets(20);
        
        Page<Ticket> results = ticketService.search(
            "",
            new TicketFilter(
                List.of(OPEN, IN_PROGRESS),
                null,
                null,
                null
            ),
            PageRequest.of(0, 20)
        );
        
        assertTrue(results.getContent().stream()
            .allMatch(t -> t.getStatus() == OPEN || t.getStatus() == IN_PROGRESS));
    }
}
```

#### Optimistic Locking Tests
```java
@DisplayName("OptimisticLockingIntegrationTest")
class OptimisticLockingIntegrationTest extends TicketIntegrationTestBase {
    
    @Test
    void testConcurrentUpdate_FirstWins() {
        Ticket ticket = ticketRepository.save(createTicket());
        Long originalVersion = ticket.getVersion();
        
        // Thread 1: Update
        Ticket t1 = ticketRepository.findById(ticket.getId()).orElseThrow();
        t1.setTitle("Update from thread 1");
        ticketRepository.save(t1);
        
        // Thread 2: Try to update with old version
        Ticket t2 = ticketRepository.findById(ticket.getId()).orElseThrow();
        t2.setTitle("Update from thread 2");
        
        assertThrows(OptimisticLockingFailureException.class, () -> {
            ticketRepository.save(t2);
        });
    }
}
```

### Contract Tests

```java
@SpringBootTest
class TicketApiContractTest {
    
    @Test
    void testCreateTicketResponse_MatchesOpenApiSpec() {
        // Validate response schema matches OpenAPI definition
    }
    
    @Test
    void testErrorResponse_MatchesProblemDetailsSpec() {
        // Verify RFC 9457 compliance
    }
}
```

---

## Frontend Testing

### Unit & Component Tests (Vitest + React Testing Library)

```typescript
describe('TicketCard', () => {
  it('should render ticket details correctly', () => {
    const ticket = {
      id: 1,
      key: 'TKT-100',
      title: 'Test',
      status: 'OPEN',
      priority: 'CRITICAL'
    };
    
    render(<TicketCard ticket={ticket} />);
    
    expect(screen.getByText('TKT-100')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toHaveClass('badge-critical');
  });
  
  it('should show quick actions on hover', async () => {
    const { container } = render(<TicketCard ticket={mockTicket} />);
    
    const card = container.querySelector('[data-testid="ticket-card"]');
    await userEvent.hover(card);
    
    expect(screen.getByText('Assign')).toBeVisible();
    expect(screen.getByText('Change Status')).toBeVisible();
  });
});

describe('StatusTransitionDialog', () => {
  it('should disable invalid transitions', () => {
    const { getByRole } = render(
      <StatusTransitionDialog 
        currentStatus="CLOSED"
        onTransition={vi.fn()}
      />
    );
    
    const openButton = getByRole('option', { name: 'OPEN' });
    expect(openButton).toBeDisabled();
  });
});

describe('CommentForm', () => {
  it('should highlight mentions with @', async () => {
    render(<CommentForm onSubmit={vi.fn()} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '@jane please review');
    
    expect(screen.getByText('@jane')).toHaveClass('mention-highlight');
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Ticket Management Flow', () => {
  test('should complete full ticket lifecycle', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="username"]', 'jane');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Create ticket
    await page.click('button:has-text("Create Ticket")');
    await page.fill('[name="title"]', 'E2E Test Ticket');
    await page.fill('[name="description"]', 'Testing the full flow');
    await page.selectOption('[name="priority"]', 'CRITICAL');
    await page.click('button:has-text("Save")');
    
    // Get ticket key from success message
    const ticketKey = await page.locator('[data-testid="ticket-key"]').textContent();
    const ticketId = ticketKey.split('-')[1];
    
    // View ticket
    await page.goto(`/tickets/${ticketId}`);
    await expect(page.locator('h1')).toContainText('E2E Test Ticket');
    
    // Add comment
    await page.fill('[data-testid="comment-input"]', 'Great issue! @jane investigating');
    await page.click('button:has-text("Post Comment")');
    await expect(page.locator('text=Great issue')).toBeVisible();
    
    // Change status
    await page.click('button:has-text("Change Status")');
    await page.click('text=In Progress');
    await expect(page.locator('[data-testid="status-badge"]')).toHaveText('IN_PROGRESS');
    
    // Verify history
    await page.click('button:has-text("View History")');
    await expect(page.locator('text=Status changed from OPEN to IN_PROGRESS')).toBeVisible();
  });
  
  test('should reject invalid status transitions', async ({ page }) => {
    await page.goto('/tickets/1');
    
    // Create ticket with CLOSED status
    // Try to change to OPEN (should fail)
    await page.click('button:has-text("Change Status")');
    
    const openButton = page.locator('button:has-text("Open")').first();
    await expect(openButton).toBeDisabled();
  });
  
  test('should validate form inputs', async ({ page }) => {
    await page.goto('/tickets/create');
    
    // Try to submit without title
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=Title is required')).toBeVisible();
  });
});

test.describe('Search & Filter', () => {
  test('should search tickets by keyword', async ({ page }) => {
    await page.goto('/tickets');
    await page.fill('[data-testid="search-input"]', 'login');
    await page.waitForLoadState('networkidle');
    
    const tickets = page.locator('[data-testid="ticket-card"]');
    await expect(tickets).toHaveCount(3); // Expected results
  });
  
  test('should filter by status and priority', async ({ page }) => {
    await page.goto('/tickets');
    
    // Filter
    await page.selectOption('[data-testid="status-filter"]', 'OPEN');
    await page.selectOption('[data-testid="priority-filter"]', 'CRITICAL');
    await page.waitForLoadState('networkidle');
    
    const results = page.locator('[data-testid="ticket-card"]');
    for (const card of await results.all()) {
      const status = await card.locator('[data-testid="status"]').textContent();
      const priority = await card.locator('[data-testid="priority"]').textContent();
      
      expect(status).toBe('OPEN');
      expect(priority).toBe('CRITICAL');
    }
  });
});
```

---

## CI/CD Quality Gates

### Pre-commit Hooks
```bash
#!/bin/bash
# Check for secrets
gitleaks detect --verbose
if [ $? -ne 0 ]; then exit 1; fi

# Format backend code
cd backend && ./mvnw spotless:apply
cd ../frontend && npm run format
```

### GitHub Actions Pipeline
```yaml
name: Quality Gates

on: [pull_request, push]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: testdb
          POSTGRES_PASSWORD: test
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '21'
      - run: cd backend && ./mvnw clean verify
      - uses: codecov/codecov-action@v3
        with:
          files: ./backend/target/site/jacoco/jacoco.xml

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd frontend && npm ci && npm test && npm run test:e2e
      - uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: gitleaks/gitleaks-action@v2
      - run: npm audit --audit-level=high
```

---

## Test Data & Seeding

```java
@Component
class TestDataSeeder {
    
    public void seedUsers() {
        User john = new User("john", "john@test.com", bcrypt("password123"));
        john.setRole(UserRole.REQUESTER);
        
        User jane = new User("jane", "jane@test.com", bcrypt("password123"));
        jane.setRole(UserRole.AGENT);
        
        User bob = new User("bob", "bob@test.com", bcrypt("password123"));
        bob.setRole(UserRole.MANAGER);
        
        userRepository.saveAll(List.of(john, jane, bob));
    }
    
    public void seedTickets() {
        User reporter = userRepository.findByUsername("john");
        User assignee = userRepository.findByUsername("jane");
        
        for (int i = 0; i < 50; i++) {
            Ticket ticket = new Ticket();
            ticket.setKey("TKT-" + (100 + i));
            ticket.setTitle("Sample Ticket #" + i);
            ticket.setDescription("Description for ticket " + i);
            ticket.setReporter(reporter);
            ticket.setAssignee(assignee);
            ticket.setStatus(TicketStatus.values()[i % TicketStatus.values().length]);
            ticket.setPriority(Priority.values()[i % Priority.values().length]);
            
            ticketRepository.save(ticket);
        }
    }
}
```

---

## Coverage Requirements

| Module | Target | Threshold |
|--------|--------|-----------|
| Service Layer | 80% | Hard fail < 75% |
| Repository | 70% | Hard fail < 65% |
| Controller | 70% | Hard fail < 60% |
| Entity | 60% | Hard fail < 50% |
| **Overall** | **75%** | **Hard fail < 70%** |

---

## Success Criteria

✅ All tests pass before merge  
✅ Coverage maintained or improved  
✅ No flaky tests  
✅ E2E tests cover critical user journeys  
✅ State machine validation tested exhaustively  
✅ Search and filtering validated with real data  
✅ Optimistic locking tested for concurrency  
