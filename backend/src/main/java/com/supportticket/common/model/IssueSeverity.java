package com.supportticket.common.model;

public enum IssueSeverity {
  TRIVIAL(0),
  LOW(1),
  MODERATE(2),
  HIGH(3),
  CRITICAL(4);

  private final int priority;

  IssueSeverity(int priority) {
    this.priority = priority;
  }

  public int getPriority() {
    return priority;
  }

  /**
   * Determines if a severity can be downgraded to another severity.
   * Generally, you can only downgrade (go to lower priority).
   */
  public boolean canDowngradeTo(IssueSeverity other) {
    return other.priority <= this.priority;
  }
}
