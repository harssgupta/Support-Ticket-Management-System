package com.supportticket.user.entity;

import com.supportticket.common.model.AccountType;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "account_holder",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "login_name"),
        @UniqueConstraint(columnNames = "email_address")
    }
)
public class AccountHolder {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "record_id")
  private Long recordId;

  @Column(name = "login_name", nullable = false, length = 50)
  private String loginName;

  @Column(name = "email_address", nullable = false, length = 100)
  private String emailAddress;

  @Column(name = "pwd_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(name = "display_name", length = 100)
  private String displayName;

  @Enumerated(EnumType.STRING)
  @Column(name = "account_type", nullable = false, length = 20)
  private AccountType accountType;

  @Column(name = "is_enabled", nullable = false)
  private Boolean isEnabled = true;

  @Column(name = "created_timestamp", nullable = false, updatable = false)
  private OffsetDateTime createdTimestamp;

  @Column(name = "modified_timestamp", nullable = false)
  private OffsetDateTime modifiedTimestamp;

  @PrePersist
  protected void onCreate() {
    if (createdTimestamp == null) {
      createdTimestamp = OffsetDateTime.now();
    }
    if (modifiedTimestamp == null) {
      modifiedTimestamp = OffsetDateTime.now();
    }
  }

  @PreUpdate
  protected void onUpdate() {
    modifiedTimestamp = OffsetDateTime.now();
  }

  // Getters and Setters
  public Long getRecordId() {
    return recordId;
  }

  public void setRecordId(Long recordId) {
    this.recordId = recordId;
  }

  public String getLoginName() {
    return loginName;
  }

  public void setLoginName(String loginName) {
    this.loginName = loginName;
  }

  public String getEmailAddress() {
    return emailAddress;
  }

  public void setEmailAddress(String emailAddress) {
    this.emailAddress = emailAddress;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public AccountType getAccountType() {
    return accountType;
  }

  public void setAccountType(AccountType accountType) {
    this.accountType = accountType;
  }

  public Boolean getIsEnabled() {
    return isEnabled;
  }

  public void setIsEnabled(Boolean isEnabled) {
    this.isEnabled = isEnabled;
  }

  public OffsetDateTime getCreatedTimestamp() {
    return createdTimestamp;
  }

  public void setCreatedTimestamp(OffsetDateTime createdTimestamp) {
    this.createdTimestamp = createdTimestamp;
  }

  public OffsetDateTime getModifiedTimestamp() {
    return modifiedTimestamp;
  }

  public void setModifiedTimestamp(OffsetDateTime modifiedTimestamp) {
    this.modifiedTimestamp = modifiedTimestamp;
  }
}
