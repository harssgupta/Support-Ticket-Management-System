package com.supportticket.issue;

import com.supportticket.common.exception.InvalidStateTransitionException;
import com.supportticket.common.model.IssueSeverity;
import com.supportticket.common.model.IssueState;
import com.supportticket.issue.entity.Issue;
import com.supportticket.issue.service.IssueManagementService;
import com.supportticket.user.entity.AccountHolder;
import com.supportticket.user.service.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@DisplayName("Issue Management Integration Tests")
class IssueManagementIntegrationTest {

  @Autowired private IssueManagementService issueService;
  @Autowired private AuthenticationService authService;
  @Autowired private PasswordEncoder passwordEncoder;

  private AccountHolder reporter;
  private AccountHolder assignee;

  @BeforeEach
  void setUp() {
    // Create test users
    reporter = new AccountHolder();
    reporter.setLoginName("john");
    reporter.setEmailAddress("john@test.com");
    reporter.setPasswordHash(passwordEncoder.encode("password123"));
    reporter.setDisplayName("John Doe");
    reporter.setAccountType(com.supportticket.common.model.AccountType.REQUESTER);
    reporter.setIsEnabled(true);
    // Save via repository would happen here

    assignee = new AccountHolder();
    assignee.setLoginName("jane");
    assignee.setEmailAddress("jane@test.com");
    assignee.setPasswordHash(passwordEncoder.encode("password123"));
    assignee.setDisplayName("Jane Smith");
    assignee.setAccountType(com.supportticket.common.model.AccountType.SUPPORT_AGENT);
    assignee.setIsEnabled(true);
  }

  @Test
  @DisplayName("should create issue with all fields")
  void testCreateIssueWithAllFields() {
    Issue issue = issueService.createNewIssue(
        "Critical bug",
        "Application crashes on startup",
        IssueSeverity.CRITICAL,
        reporter,
        assignee
    );

    assertNotNull(issue.getIssueId());
    assertNotNull(issue.getIssueKey());
    assertTrue(issue.getIssueKey().startsWith("ISS-"));
    assertEquals("Critical bug", issue.getSubjectLine());
    assertEquals(IssueSeverity.CRITICAL, issue.getSeverityLevel());
    assertEquals(IssueState.NEWLY_OPENED, issue.getCurrentState());
    assertEquals(reporter, issue.getReportingUser());
    assertEquals(assignee, issue.getAssignedToUser());
  }

  @Test
  @DisplayName("should transition through valid states")
  void testValidStateTransitions() {
    Issue issue = issueService.createNewIssue(
        "Test issue",
        "Test",
        IssueSeverity.HIGH,
        reporter,
        assignee
    );

    // NEWLY_OPENED → IN_WORK
    Issue inWork = issueService.transitionIssueState(
        issue.getIssueId(),
        IssueState.IN_WORK,
        assignee,
        "Starting work"
    );
    assertEquals(IssueState.IN_WORK, inWork.getCurrentState());

    // IN_WORK → AWAITING_RESOLUTION
    Issue awaitingResolution = issueService.transitionIssueState(
        issue.getIssueId(),
        IssueState.AWAITING_RESOLUTION,
        assignee,
        "Waiting for confirmation"
    );
    assertEquals(IssueState.AWAITING_RESOLUTION, awaitingResolution.getCurrentState());

    // AWAITING_RESOLUTION → CLOSURE
    Issue closed = issueService.transitionIssueState(
        issue.getIssueId(),
        IssueState.CLOSURE,
        assignee,
        "Issue resolved"
    );
    assertEquals(IssueState.CLOSURE, closed.getCurrentState());
  }

  @Test
  @DisplayName("should reject invalid state transitions")
  void testInvalidStateTransition() {
    Issue issue = issueService.createNewIssue(
        "Test issue",
        "Test",
        IssueSeverity.MODERATE,
        reporter,
        null
    );

    // Try invalid transition: NEWLY_OPENED → CLOSURE
    assertThrows(InvalidStateTransitionException.class, () -> {
      issueService.transitionIssueState(
          issue.getIssueId(),
          IssueState.CLOSURE,
          reporter,
          "Should fail"
      );
    });
  }

  @Test
  @DisplayName("should update issue fields")
  void testUpdateIssueFields() {
    Issue issue = issueService.createNewIssue(
        "Original title",
        "Original description",
        IssueSeverity.LOW,
        reporter,
        null
    );

    Issue updated = issueService.updateIssueFields(
        issue.getIssueId(),
        "Updated title",
        "Updated description",
        IssueSeverity.CRITICAL,
        assignee
    );

    assertEquals("Updated title", updated.getSubjectLine());
    assertEquals("Updated description", updated.getProblemDescription());
    assertEquals(IssueSeverity.CRITICAL, updated.getSeverityLevel());
    assertEquals(assignee, updated.getAssignedToUser());
  }

  @Test
  @DisplayName("should count issues by state")
  void testCountIssuesByState() {
    // Create multiple issues
    issueService.createNewIssue("Issue 1", "Desc 1", IssueSeverity.HIGH, reporter, null);
    issueService.createNewIssue("Issue 2", "Desc 2", IssueSeverity.MODERATE, reporter, null);
    issueService.createNewIssue("Issue 3", "Desc 3", IssueSeverity.LOW, reporter, null);

    long openCount = issueService.countIssuesByState(IssueState.NEWLY_OPENED);
    assertTrue(openCount >= 3, "Should have at least 3 open issues");
  }

  @Test
  @DisplayName("should retrieve issue by ID")
  void testRetrieveIssueById() {
    Issue created = issueService.createNewIssue(
        "Test",
        "Test description",
        IssueSeverity.HIGH,
        reporter,
        assignee
    );

    Issue retrieved = issueService.retrieveIssueById(created.getIssueId());

    assertEquals(created.getIssueId(), retrieved.getIssueId());
    assertEquals(created.getSubjectLine(), retrieved.getSubjectLine());
  }

  @Test
  @DisplayName("should enforce read-only constraint on closed issues")
  void testClosedIssueIsReadOnly() {
    Issue issue = issueService.createNewIssue(
        "Test",
        "Test",
        IssueSeverity.HIGH,
        reporter,
        assignee
    );

    // Transition to CLOSURE
    issueService.transitionIssueState(
        issue.getIssueId(),
        IssueState.IN_WORK,
        assignee,
        ""
    );
    issueService.transitionIssueState(
        issue.getIssueId(),
        IssueState.AWAITING_RESOLUTION,
        assignee,
        ""
    );
    Issue closed = issueService.transitionIssueState(
        issue.getIssueId(),
        IssueState.CLOSURE,
        assignee,
        ""
    );

    // Try to update closed issue - should fail
    assertThrows(IllegalStateException.class, () -> {
      issueService.updateIssueFields(
          closed.getIssueId(),
          "New title",
          "New description",
          IssueSeverity.LOW,
          null
      );
    });
  }

  @Test
  @DisplayName("should maintain optimistic locking version")
  void testOptimisticLockingVersion() {
    Issue created = issueService.createNewIssue(
        "Test",
        "Test",
        IssueSeverity.MODERATE,
        reporter,
        null
    );

    Long initialVersion = created.getConcurrencyVersion();

    Issue updated = issueService.updateIssueFields(
        created.getIssueId(),
        "Updated",
        "Updated",
        IssueSeverity.HIGH,
        assignee
    );

    assertTrue(updated.getConcurrencyVersion() > initialVersion,
        "Version should increment on update");
  }
}
