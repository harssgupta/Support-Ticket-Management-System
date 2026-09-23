package com.supportticket.common.model;

public enum AccountType {
  REQUESTER("Issue Reporter"),
  SUPPORT_AGENT("Support Agent"),
  SUPERVISOR("Supervisor"),
  SYSTEM_ADMIN("System Administrator");

  private final String description;

  AccountType(String description) {
    this.description = description;
  }

  public String getDescription() {
    return description;
  }

  public boolean canViewAllIssues() {
    return this == SUPPORT_AGENT || this == SUPERVISOR || this == SYSTEM_ADMIN;
  }

  public boolean canAssignIssues() {
    return this == SUPERVISOR || this == SYSTEM_ADMIN;
  }

  public boolean canManageUsers() {
    return this == SYSTEM_ADMIN;
  }
}
