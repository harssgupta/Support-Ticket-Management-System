package com.supportticket.issue.entity;

import com.supportticket.user.entity.AccountHolder;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "issue_message",
    indexes = {
        @Index(name = "idx_issue_message_issue", columnList = "issue_id"),
        @Index(name = "idx_issue_message_author", columnList = "author_user_id"),
        @Index(name = "idx_issue_message_parent", columnList = "parent_msg_id"),
        @Index(name = "idx_issue_message_posted_at", columnList = "posted_at")
    }
)
public class IssueMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "msg_id")
  private Long msgId;

  @ManyToOne(optional = false)
  @JoinColumn(name = "issue_id", nullable = false)
  private Issue issue;

  @ManyToOne(optional = false)
  @JoinColumn(name = "author_user_id", nullable = false)
  private AccountHolder authorUser;

  @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
  private String messageText;

  @ManyToOne
  @JoinColumn(name = "parent_msg_id")
  private IssueMessage parentMessage;

  @OneToMany(mappedBy = "parentMessage", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<IssueMessage> replies = new ArrayList<>();

  @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<AttachedFile> attachments = new ArrayList<>();

  @Column(name = "posted_at", nullable = false, updatable = false)
  private OffsetDateTime postedAt;

  @Column(name = "updated_at", nullable = false)
  private OffsetDateTime updatedAt;

  @Version
  @Column(name = "concurrency_version")
  private Long concurrencyVersion;

  @PrePersist
  protected void onCreate() {
    if (postedAt == null) {
      postedAt = OffsetDateTime.now();
    }
    if (updatedAt == null) {
      updatedAt = OffsetDateTime.now();
    }
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = OffsetDateTime.now();
  }

  // Getters and Setters
  public Long getMsgId() {
    return msgId;
  }

  public void setMsgId(Long msgId) {
    this.msgId = msgId;
  }

  public Issue getIssue() {
    return issue;
  }

  public void setIssue(Issue issue) {
    this.issue = issue;
  }

  public AccountHolder getAuthorUser() {
    return authorUser;
  }

  public void setAuthorUser(AccountHolder authorUser) {
    this.authorUser = authorUser;
  }

  public String getMessageText() {
    return messageText;
  }

  public void setMessageText(String messageText) {
    this.messageText = messageText;
  }

  public IssueMessage getParentMessage() {
    return parentMessage;
  }

  public void setParentMessage(IssueMessage parentMessage) {
    this.parentMessage = parentMessage;
  }

  public List<IssueMessage> getReplies() {
    return replies;
  }

  public void setReplies(List<IssueMessage> replies) {
    this.replies = replies;
  }

  public List<AttachedFile> getAttachments() {
    return attachments;
  }

  public void setAttachments(List<AttachedFile> attachments) {
    this.attachments = attachments;
  }

  public OffsetDateTime getPostedAt() {
    return postedAt;
  }

  public void setPostedAt(OffsetDateTime postedAt) {
    this.postedAt = postedAt;
  }

  public OffsetDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(OffsetDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public Long getConcurrencyVersion() {
    return concurrencyVersion;
  }

  public void setConcurrencyVersion(Long concurrencyVersion) {
    this.concurrencyVersion = concurrencyVersion;
  }
}
