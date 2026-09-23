package com.supportticket.issue.service;

import com.supportticket.common.exception.InvalidStateTransitionException;
import com.supportticket.common.model.IssueSeverity;
import com.supportticket.common.model.IssueState;
import com.supportticket.issue.entity.Issue;
import com.supportticket.issue.entity.StateChangeLog;
import com.supportticket.issue.repository.IssueRepository;
import com.supportticket.issue.repository.StateChangeLogRepository;
import com.supportticket.user.entity.AccountHolder;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.concurrent.atomic.AtomicLong;

@Service
@Transactional
public class IssueManagementService {

  private final IssueRepository issueRepository;
  private final StateChangeLogRepository stateChangeLogRepository;
  private final AtomicLong issueKeyCounter;

  public IssueManagementService(
      IssueRepository issueRepository,
      StateChangeLogRepository stateChangeLogRepository
  ) {
    this.issueRepository = issueRepository;
    this.stateChangeLogRepository = stateChangeLogRepository;
    // Seed from the current row count rather than a fixed literal - a
    // static counter starting at the same value on every JVM restart
    // collides with issue_key values already persisted from before the
    // restart, violating the UNIQUE constraint on the very next create.
    this.issueKeyCounter = new AtomicLong(1000 + issueRepository.count());
  }

  /**
   * Create a new issue.
   */
  public Issue createNewIssue(
      String subjectLine,
      String problemDescription,
      IssueSeverity severityLevel,
      AccountHolder reportingUser,
      AccountHolder assignedToUser
  ) {
    Issue newIssue = new Issue();
    newIssue.setIssueKey(generateIssueKey());
    newIssue.setSubjectLine(subjectLine);
    newIssue.setProblemDescription(problemDescription);
    newIssue.setSeverityLevel(severityLevel);
    newIssue.setCurrentState(IssueState.NEWLY_OPENED);
    newIssue.setReportingUser(reportingUser);
    newIssue.setAssignedToUser(assignedToUser);
    newIssue.setCreatedAt(OffsetDateTime.now());
    newIssue.setLastModifiedAt(OffsetDateTime.now());

    return issueRepository.save(newIssue);
  }

  /**
   * Retrieve an issue by ID.
   */
  @Transactional(readOnly = true)
  public Issue retrieveIssueById(Long issueId) {
    return issueRepository
        .findById(issueId)
        .orElseThrow(
            () -> new EntityNotFoundException("Issue not found with ID: " + issueId)
        );
  }

  /**
   * Update issue fields (subject, description, severity, assignee).
   */
  public Issue updateIssueFields(
      Long issueId,
      String subjectLine,
      String problemDescription,
      IssueSeverity severityLevel,
      AccountHolder newAssignee
  ) {
    Issue issue = retrieveIssueById(issueId);

    if (!issue.isModifiable()) {
      throw new IllegalStateException(
          "Cannot modify issue in state: " + issue.getCurrentState()
      );
    }

    issue.setSubjectLine(subjectLine);
    issue.setProblemDescription(problemDescription);
    issue.setSeverityLevel(severityLevel);
    issue.setAssignedToUser(newAssignee);
    issue.setLastModifiedAt(OffsetDateTime.now());

    return issueRepository.save(issue);
  }

  /**
   * Transition an issue to a new state with strict validation.
   * Enforces the state machine rules.
   */
  public Issue transitionIssueState(
      Long issueId,
      IssueState targetState,
      AccountHolder changedByUser,
      String transitionReason
  ) {
    Issue issue = retrieveIssueById(issueId);
    IssueState currentState = issue.getCurrentState();

    // Validate transition
    if (!currentState.canTransitionTo(targetState)) {
      throw new InvalidStateTransitionException(
          currentState,
          targetState,
          currentState.getAllowedTransitions()
      );
    }

    // An issue must have an assignee before it can be closed (enforced at the DB
    // level too, via a CHECK constraint - validated here first for a clear message).
    if (targetState == IssueState.CLOSURE && issue.getAssignedToUser() == null) {
      throw new IllegalStateException(
          "Cannot close an unassigned issue. Assign it to someone first."
      );
    }

    // Record the state change
    StateChangeLog changeLog = new StateChangeLog();
    changeLog.setIssue(issue);
    changeLog.setTransitionFromState(currentState);
    changeLog.setTransitionToState(targetState);
    changeLog.setChangedByUser(changedByUser);
    changeLog.setTransitionReason(transitionReason);
    changeLog.setChangeTimestamp(OffsetDateTime.now());
    stateChangeLogRepository.save(changeLog);

    // Update issue state
    issue.setCurrentState(targetState);
    issue.setLastModifiedAt(OffsetDateTime.now());

    // Record timestamps for SLA tracking
    if (targetState == IssueState.IN_WORK && issue.getFirstResponseTimestamp() == null) {
      issue.setFirstResponseTimestamp(OffsetDateTime.now());
    }
    if (targetState == IssueState.AWAITING_RESOLUTION && issue.getResolvedTimestamp() == null) {
      issue.setResolvedTimestamp(OffsetDateTime.now());
    }

    return issueRepository.save(issue);
  }

  /**
   * Search issues with various filters.
   */
  @Transactional(readOnly = true)
  public Page<Issue> searchIssues(
      String searchTerm,
      IssueState state,
      IssueSeverity severity,
      Pageable pageable
  ) {
    return issueRepository.searchIssues(searchTerm, state, severity, pageable);
  }

  /**
   * Get issues by current state.
   */
  @Transactional(readOnly = true)
  public Page<Issue> getIssuesByState(IssueState state, Pageable pageable) {
    return issueRepository.findByCurrentState(state, pageable);
  }

  /**
   * Get issues assigned to a user.
   */
  @Transactional(readOnly = true)
  public Page<Issue> getIssuesAssignedTo(AccountHolder user, Pageable pageable) {
    return issueRepository.findByAssignedToUser(user, pageable);
  }

  /**
   * Get count of issues in a specific state.
   */
  @Transactional(readOnly = true)
  public long countIssuesByState(IssueState state) {
    return issueRepository.countByCurrentState(state);
  }

  /**
   * Generate a unique issue key.
   */
  private String generateIssueKey() {
    return "ISS-" + issueKeyCounter.incrementAndGet();
  }
}
