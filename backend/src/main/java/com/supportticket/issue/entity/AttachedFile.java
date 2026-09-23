package com.supportticket.issue.entity;

import com.supportticket.user.entity.AccountHolder;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "attached_file",
    indexes = {
        @Index(name = "idx_attached_file_issue", columnList = "issue_id"),
        @Index(name = "idx_attached_file_message", columnList = "msg_id"),
        @Index(name = "idx_attached_file_uploaded_by", columnList = "uploaded_by_user_id")
    }
)
public class AttachedFile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "file_id")
  private Long fileId;

  @ManyToOne
  @JoinColumn(name = "issue_id")
  private Issue issue;

  @ManyToOne
  @JoinColumn(name = "msg_id")
  private IssueMessage message;

  @Column(name = "file_name", nullable = false, length = 255)
  private String fileName;

  @Column(name = "stored_file_uri", nullable = false, columnDefinition = "TEXT")
  private String storedFileUri;

  @Column(name = "file_byte_size", nullable = false)
  private Long fileByteSize;

  @Column(name = "mime_type_code", length = 50)
  private String mimeTypeCode;

  @ManyToOne(optional = false)
  @JoinColumn(name = "uploaded_by_user_id", nullable = false)
  private AccountHolder uploadedByUser;

  @Column(name = "upload_timestamp", nullable = false, updatable = false)
  private OffsetDateTime uploadTimestamp;

  @PrePersist
  protected void onCreate() {
    if (uploadTimestamp == null) {
      uploadTimestamp = OffsetDateTime.now();
    }
  }

  // Getters and Setters
  public Long getFileId() {
    return fileId;
  }

  public void setFileId(Long fileId) {
    this.fileId = fileId;
  }

  public Issue getIssue() {
    return issue;
  }

  public void setIssue(Issue issue) {
    this.issue = issue;
  }

  public IssueMessage getMessage() {
    return message;
  }

  public void setMessage(IssueMessage message) {
    this.message = message;
  }

  public String getFileName() {
    return fileName;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public String getStoredFileUri() {
    return storedFileUri;
  }

  public void setStoredFileUri(String storedFileUri) {
    this.storedFileUri = storedFileUri;
  }

  public Long getFileByteSize() {
    return fileByteSize;
  }

  public void setFileByteSize(Long fileByteSize) {
    this.fileByteSize = fileByteSize;
  }

  public String getMimeTypeCode() {
    return mimeTypeCode;
  }

  public void setMimeTypeCode(String mimeTypeCode) {
    this.mimeTypeCode = mimeTypeCode;
  }

  public AccountHolder getUploadedByUser() {
    return uploadedByUser;
  }

  public void setUploadedByUser(AccountHolder uploadedByUser) {
    this.uploadedByUser = uploadedByUser;
  }

  public OffsetDateTime getUploadTimestamp() {
    return uploadTimestamp;
  }

  public void setUploadTimestamp(OffsetDateTime uploadTimestamp) {
    this.uploadTimestamp = uploadTimestamp;
  }
}
