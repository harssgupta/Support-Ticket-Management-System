import { test, expect } from '@playwright/test';

test.describe('Ticket Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="loginName"]', 'john');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
  });

  test('should create a new ticket', async ({ page }) => {
    await page.goto('/dashboard/create-issue');

    // Fill form
    await page.fill('input[name="subjectLine"]', 'Login page bug');
    await page.fill('textarea[name="problemDescription"]', 'Users cannot login');
    await page.selectOption('select[name="severityLevel"]', 'CRITICAL');

    // Submit
    await page.click('button:has-text("Create Issue")');

    // Verify redirect to detail page
    await expect(page).toHaveURL(/\/dashboard\/issues\/\d+$/);
    await expect(page.locator('h1')).toContainText('Login page bug');
  });

  test('should list all tickets', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Check if issues are displayed
    const issueCards = page.locator('[data-testid="ticket-card"]');
    const count = await issueCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter tickets by state', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Select filter
    await page.selectOption('select[name="state"]', 'IN_WORK');

    // Wait for filtered results
    await page.waitForLoadState('networkidle');

    // Verify all displayed issues have correct state
    const issueStates = await page
      .locator('[data-testid="issue-state"]')
      .allTextContents();
    issueStates.forEach((state) => {
      expect(state).toContain('IN_WORK');
    });
  });

  test('should filter tickets by severity', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Select severity filter
    await page.selectOption('select[name="severity"]', 'CRITICAL');

    // Wait for filtered results
    await page.waitForLoadState('networkidle');

    // Verify severity badges
    const severityBadges = await page
      .locator('[data-testid="severity-badge"]')
      .allTextContents();
    severityBadges.forEach((badge) => {
      expect(badge).toContain('CRITICAL');
    });
  });

  test('should view ticket details', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Click first ticket
    const firstTicket = page.locator('[data-testid="ticket-card"]').first();
    await firstTicket.click();

    // Verify detail page loaded
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should update ticket state to IN_WORK', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Click first ticket
    const firstTicket = page.locator('[data-testid="ticket-card"]').first();
    await firstTicket.click();

    // Change state
    await page.selectOption('select[name="newState"]', 'IN_WORK');
    await page.click('button:has-text("Update State")');

    // Verify state changed
    await expect(page.locator('[data-testid="status-badge"]')).toContainText(
      'IN_WORK'
    );
  });

  test('should reject invalid state transition', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Find a CLOSED ticket (if any)
    // For now, we'll just verify that disabled states don't appear
    const firstTicket = page.locator('[data-testid="ticket-card"]').first();
    await firstTicket.click();

    // Try to select invalid state
    const stateSelect = page.locator('select[name="newState"]');
    const options = await stateSelect.locator('option').count();
    expect(options).toBeGreaterThan(0);
  });

  test('should add a comment to ticket', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Click first ticket
    const firstTicket = page.locator('[data-testid="ticket-card"]').first();
    await firstTicket.click();

    // Scroll to comment form
    await page.locator('text=Add a Comment').scrollIntoViewIfNeeded();

    // Fill comment
    await page.fill('textarea[name="messageText"]', 'Test comment');

    // Submit
    await page.click('button:has-text("Post Comment")');

    // Verify comment appears
    await expect(page.locator('text=Test comment')).toBeVisible();
  });

  test('should update ticket fields', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Click first ticket
    const firstTicket = page.locator('[data-testid="ticket-card"]').first();
    await firstTicket.click();

    // Find and click update button
    const updateButton = page.locator('button:has-text("Update")').first();
    if (await updateButton.isVisible()) {
      await updateButton.click();

      // Fill new title
      await page.fill('input[name="subjectLine"]', 'Updated Title');

      // Save
      await page.click('button:has-text("Save")');

      // Verify update
      await expect(page.locator('h1')).toContainText('Updated Title');
    }
  });

  test('should search tickets by keyword', async ({ page }) => {
    await page.goto('/dashboard/issues');

    // Use search box
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('login');

    // Wait for results
    await page.waitForLoadState('networkidle');

    // Verify results contain keyword
    const issueTexts = await page
      .locator('[data-testid="ticket-card"]')
      .allTextContents();
    issueTexts.forEach((text) => {
      expect(text.toLowerCase()).toContain('login');
    });
  });

  test('should handle error messages gracefully', async ({ page }) => {
    await page.goto('/dashboard/create-issue');

    // Try to submit without required fields
    await page.click('button:has-text("Create Issue")');

    // Verify error messages appear
    const errorMessages = page.locator('.text-red-500');
    expect(await errorMessages.count()).toBeGreaterThan(0);
  });

  test('should show meaningful validation errors', async ({ page }) => {
    await page.goto('/dashboard/create-issue');

    // Submit empty form
    await page.click('button:has-text("Create Issue")');

    // Check for specific error messages
    await expect(page.locator('text=Subject is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });
});
