package com.supportticket.issue.entity;

import com.supportticket.common.model.IssueState;
import com.supportticket.user.entity.AccountHolder;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "state_change_log",
    indexes = {
        @Index(name = "idx_state_change_log_issue", columnList = "issue_id"),
        @Index(name = "idx_state_change_log_timestamp", columnList = "change_timestamp")
    }
)
public class StateChangeLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "log_id")
  private Long logId;

  @ManyToOne(optional = false)
  @JoinColumn(name = "issue_id", nullable = false)
  private Issue issue;

  @Enumerated(EnumType.STRING)
  @Column(name = "transition_from_state", nullable = false, length = 20)
  private IssueState transitionFromState;

  @Enumerated(EnumType.STRING)
  @Column(name = "transition_to_state", nullable = false, length = 20)
  private IssueState transitionToState;

  @ManyToOne(optional = false)
  @JoinColumn(name = "changed_by_user_id", nullable = false)
  private AccountHolder changedByUser;

  @Column(name = "change_timestamp", nullable = false, updatable = false)
  private OffsetDateTime changeTimestamp;

  @Column(name = "transition_reason", columnDefinition = "TEXT")
  private String transitionReason;

  @PrePersist
  protected void onCreate() {
    if (changeTimestamp == null) {
      changeTimestamp = OffsetDateTime.now();
    }
  }

  // Getters and Setters
  public Long getLogId() {
    return logId;
  }

  public void setLogId(Long logId) {
    this.logId = logId;
  }

  public Issue getIssue() {
    return issue;
  }

  public void setIssue(Issue issue) {
    this.issue = issue;
  }

  public IssueState getTransitionFromState() {
    return transitionFromState;
  }

  public void setTransitionFromState(IssueState transitionFromState) {
    this.transitionFromState = transitionFromState;
  }

  public IssueState getTransitionToState() {
    return transitionToState;
  }

  public void setTransitionToState(IssueState transitionToState) {
    this.transitionToState = transitionToState;
  }

  public AccountHolder getChangedByUser() {
    return changedByUser;
  }

  public void setChangedByUser(AccountHolder changedByUser) {
    this.changedByUser = changedByUser;
  }

  public OffsetDateTime getChangeTimestamp() {
    return changeTimestamp;
  }

  public void setChangeTimestamp(OffsetDateTime changeTimestamp) {
    this.changeTimestamp = changeTimestamp;
  }

  public String getTransitionReason() {
    return transitionReason;
  }

  public void setTransitionReason(String transitionReason) {
    this.transitionReason = transitionReason;
  }
}
