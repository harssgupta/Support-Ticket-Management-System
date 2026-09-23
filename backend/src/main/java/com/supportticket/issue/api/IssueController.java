package com.supportticket.issue.api;

import com.supportticket.common.model.IssueSeverity;
import com.supportticket.common.model.IssueState;
import com.supportticket.issue.entity.Issue;
import com.supportticket.issue.service.IssueManagementService;
import com.supportticket.user.entity.AccountHolder;
import com.supportticket.user.service.AuthenticationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/issues")
public class IssueController {

  private final IssueManagementService issueService;
  private final AuthenticationService authService;

  public IssueController(
      IssueManagementService issueService,
      AuthenticationService authService
  ) {
    this.issueService = issueService;
    this.authService = authService;
  }

  @PostMapping
  public ResponseEntity<IssueResponse> createIssue(
      @RequestBody CreateIssueRequest request,
      @RequestHeader(value = "X-User-ID", required = false, defaultValue = "1") Long userId
  ) {
    AccountHolder reporter = authService.getAccountById(userId);
    AccountHolder assignee = request.assignedToUserId() != null
        ? authService.getAccountById(request.assignedToUserId())
        : null;

    Issue createdIssue = issueService.createNewIssue(
        request.subjectLine(),
        request.problemDescription(),
        request.severityLevel(),
        reporter,
        assignee
    );

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(IssueResponse.from(createdIssue));
  }

  @GetMapping("/{issueId}")
  public ResponseEntity<IssueResponse> getIssue(@PathVariable Long issueId) {
    Issue issue = issueService.retrieveIssueById(issueId);
    return ResponseEntity.ok(IssueResponse.from(issue));
  }

  @PatchMapping("/{issueId}")
  public ResponseEntity<IssueResponse> updateIssue(
      @PathVariable Long issueId,
      @RequestBody UpdateIssueRequest request,
      @RequestHeader(value = "X-User-ID", required = false, defaultValue = "1") Long userId
  ) {
    AccountHolder assignee = request.assignedToUserId() != null
        ? authService.getAccountById(request.assignedToUserId())
        : null;

    Issue updatedIssue = issueService.updateIssueFields(
        issueId,
        request.subjectLine(),
        request.problemDescription(),
        request.severityLevel(),
        assignee
    );

    return ResponseEntity.ok(IssueResponse.from(updatedIssue));
  }

  @PatchMapping("/{issueId}/state")
  public ResponseEntity<IssueResponse> transitionIssueState(
      @PathVariable Long issueId,
      @RequestBody TransitionStateRequest request,
      @RequestHeader(value = "X-User-ID", required = false, defaultValue = "1") Long userId
  ) {
    AccountHolder changedByUser = authService.getAccountById(userId);

    Issue transitionedIssue = issueService.transitionIssueState(
        issueId,
        request.targetState(),
        changedByUser,
        request.transitionReason()
    );

    return ResponseEntity.ok(IssueResponse.from(transitionedIssue));
  }

  @GetMapping
  public ResponseEntity<Page<IssueResponse>> searchIssues(
      @RequestParam(required = false) String searchTerm,
      @RequestParam(required = false) IssueState state,
      @RequestParam(required = false) IssueSeverity severity,
      Pageable pageable
  ) {
    Page<Issue> results = issueService.searchIssues(searchTerm, state, severity, pageable);
    return ResponseEntity.ok(results.map(IssueResponse::from));
  }

  // DTOs
  public record CreateIssueRequest(
      String subjectLine,
      String problemDescription,
      IssueSeverity severityLevel,
      Long assignedToUserId
  ) {}

  public record UpdateIssueRequest(
      String subjectLine,
      String problemDescription,
      IssueSeverity severityLevel,
      Long assignedToUserId
  ) {}

  public record TransitionStateRequest(
      IssueState targetState,
      String transitionReason
  ) {}

  public record IssueResponse(
      Long issueId,
      String issueKey,
      String subjectLine,
      String problemDescription,
      IssueSeverity severityLevel,
      IssueState currentState,
      String reporterName,
      String assignedToName,
      Long messageCount,
      String createdAt,
      String lastModifiedAt,
      Long concurrencyVersion
  ) {
    public static IssueResponse from(Issue issue) {
      return new IssueResponse(
          issue.getIssueId(),
          issue.getIssueKey(),
          issue.getSubjectLine(),
          issue.getProblemDescription(),
          issue.getSeverityLevel(),
          issue.getCurrentState(),
          issue.getReportingUser().getDisplayName(),
          issue.getAssignedToUser() != null
              ? issue.getAssignedToUser().getDisplayName()
              : null,
          0L, // Message count will be populated by service
          issue.getCreatedAt().toString(),
          issue.getLastModifiedAt().toString(),
          issue.getConcurrencyVersion()
      );
    }
  }
}
