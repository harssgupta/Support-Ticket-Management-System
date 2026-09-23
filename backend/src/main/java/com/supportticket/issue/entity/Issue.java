package com.supportticket.issue.entity;

import com.supportticket.common.model.IssueSeverity;
import com.supportticket.common.model.IssueState;
import com.supportticket.user.entity.AccountHolder;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(
    name = "issue",
    indexes = {
        @Index(name = "idx_issue_state_severity", columnList = "current_state,severity_level"),
        @Index(name = "idx_issue_assigned_to", columnList = "assigned_to_user_id"),
        @Index(name = "idx_issue_created_at", columnList = "created_at"),
        @Index(name = "idx_issue_reporter", columnList = "reporting_user_id")
    }
)
public class Issue {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "issue_id")
  private Long issueId;

  @Column(name = "issue_key", unique = true, nullable = false, length = 20)
  private String issueKey;

  @Column(name = "subject_line", nullable = false, length = 255)
  private String subjectLine;

  @Column(name = "problem_description", columnDefinition = "TEXT")
  private String problemDescription;

  @Enumerated(EnumType.STRING)
  @Column(name = "severity_level", nullable = false, length = 20)
  private IssueSeverity severityLevel;

  @Enumerated(EnumType.STRING)
  @Column(name = "current_state", nullable = false, length = 20)
  private IssueState currentState = IssueState.NEWLY_OPENED;

  @ManyToOne(optional = false)
  @JoinColumn(name = "reporting_user_id", nullable = false)
  private AccountHolder reportingUser;

  @ManyToOne
  @JoinColumn(name = "assigned_to_user_id")
  private AccountHolder assignedToUser;

  @ManyToMany
  @JoinTable(
      name = "issue_follower",
      joinColumns = @JoinColumn(name = "issue_id"),
      inverseJoinColumns = @JoinColumn(name = "following_user_id")
  )
  private Set<AccountHolder> followers = new HashSet<>();

  @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<IssueMessage> messages = new ArrayList<>();

  @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<StateChangeLog> stateChanges = new ArrayList<>();

  @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<AttachedFile> attachments = new ArrayList<>();

  @Column(name = "created_at", nullable = false, updatable = false)
  private OffsetDateTime createdAt;

  @Column(name = "last_modified_at", nullable = false)
  private OffsetDateTime lastModifiedAt;

  @Column(name = "first_response_timestamp")
  private OffsetDateTime firstResponseTimestamp;

  @Column(name = "resolved_timestamp")
  private OffsetDateTime resolvedTimestamp;

  @Version
  @Column(name = "concurrency_version")
  private Long concurrencyVersion;

  @PrePersist
  protected void onCreate() {
    if (createdAt == null) {
      createdAt = OffsetDateTime.now();
    }
    if (lastModifiedAt == null) {
      lastModifiedAt = OffsetDateTime.now();
    }
  }

  @PreUpdate
  protected void onUpdate() {
    lastModifiedAt = OffsetDateTime.now();
  }

  // Business logic methods
  public boolean canTransitionTo(IssueState newState) {
    return currentState.canTransitionTo(newState);
  }

  public Set<IssueState> getAllowedTransitions() {
    return currentState.getAllowedTransitions();
  }

  public boolean isModifiable() {
    return currentState.isModifiable();
  }

  public boolean isReadOnly() {
    return currentState == IssueState.CLOSURE || currentState == IssueState.WITHDRAWN;
  }

  // Getters and Setters
  public Long getIssueId() {
    return issueId;
  }

  public void setIssueId(Long issueId) {
    this.issueId = issueId;
  }

  public String getIssueKey() {
    return issueKey;
  }

  public void setIssueKey(String issueKey) {
    this.issueKey = issueKey;
  }

  public String getSubjectLine() {
    return subjectLine;
  }

  public void setSubjectLine(String subjectLine) {
    this.subjectLine = subjectLine;
  }

  public String getProblemDescription() {
    return problemDescription;
  }

  public void setProblemDescription(String problemDescription) {
    this.problemDescription = problemDescription;
  }

  public IssueSeverity getSeverityLevel() {
    return severityLevel;
  }

  public void setSeverityLevel(IssueSeverity severityLevel) {
    this.severityLevel = severityLevel;
  }

  public IssueState getCurrentState() {
    return currentState;
  }

  public void setCurrentState(IssueState currentState) {
    this.currentState = currentState;
  }

  public AccountHolder getReportingUser() {
    return reportingUser;
  }

  public void setReportingUser(AccountHolder reportingUser) {
    this.reportingUser = reportingUser;
  }

  public AccountHolder getAssignedToUser() {
    return assignedToUser;
  }

  public void setAssignedToUser(AccountHolder assignedToUser) {
    this.assignedToUser = assignedToUser;
  }

  public Set<AccountHolder> getFollowers() {
    return followers;
  }

  public void setFollowers(Set<AccountHolder> followers) {
    this.followers = followers;
  }

  public List<IssueMessage> getMessages() {
    return messages;
  }

  public void setMessages(List<IssueMessage> messages) {
    this.messages = messages;
  }

  public List<StateChangeLog> getStateChanges() {
    return stateChanges;
  }

  public void setStateChanges(List<StateChangeLog> stateChanges) {
    this.stateChanges = stateChanges;
  }

  public List<AttachedFile> getAttachments() {
    return attachments;
  }

  public void setAttachments(List<AttachedFile> attachments) {
    this.attachments = attachments;
  }

  public OffsetDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(OffsetDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public OffsetDateTime getLastModifiedAt() {
    return lastModifiedAt;
  }

  public void setLastModifiedAt(OffsetDateTime lastModifiedAt) {
    this.lastModifiedAt = lastModifiedAt;
  }

  public OffsetDateTime getFirstResponseTimestamp() {
    return firstResponseTimestamp;
  }

  public void setFirstResponseTimestamp(OffsetDateTime firstResponseTimestamp) {
    this.firstResponseTimestamp = firstResponseTimestamp;
  }

  public OffsetDateTime getResolvedTimestamp() {
    return resolvedTimestamp;
  }

  public void setResolvedTimestamp(OffsetDateTime resolvedTimestamp) {
    this.resolvedTimestamp = resolvedTimestamp;
  }

  public Long getConcurrencyVersion() {
    return concurrencyVersion;
  }

  public void setConcurrencyVersion(Long concurrencyVersion) {
    this.concurrencyVersion = concurrencyVersion;
  }
}
