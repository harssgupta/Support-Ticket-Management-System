package com.supportticket.common.model;

import java.util.Set;

public enum IssueState {
  NEWLY_OPENED("Newly Opened"),
  IN_WORK("In Work"),
  AWAITING_RESOLUTION("Awaiting Resolution"),
  CLOSURE("Closure"),
  WITHDRAWN("Withdrawn");

  private final String displayName;

  IssueState(String displayName) {
    this.displayName = displayName;
  }

  public String getDisplayName() {
    return displayName;
  }

  /**
   * Determines valid state transitions for the issue lifecycle.
   * State machine:
   * NEWLY_OPENED -> IN_WORK, WITHDRAWN
   * IN_WORK -> AWAITING_RESOLUTION, WITHDRAWN
   * AWAITING_RESOLUTION -> CLOSURE
   * CLOSURE -> (no transitions, read-only)
   * WITHDRAWN -> (no transitions, terminal)
   */
  public boolean canTransitionTo(IssueState targetState) {
    return switch (this) {
      case NEWLY_OPENED -> targetState == IN_WORK || targetState == WITHDRAWN;
      case IN_WORK -> targetState == AWAITING_RESOLUTION || targetState == WITHDRAWN;
      case AWAITING_RESOLUTION -> targetState == CLOSURE;
      default -> false;
    };
  }

  /**
   * Get allowed transitions from current state.
   */
  public Set<IssueState> getAllowedTransitions() {
    return switch (this) {
      case NEWLY_OPENED -> Set.of(IN_WORK, WITHDRAWN);
      case IN_WORK -> Set.of(AWAITING_RESOLUTION, WITHDRAWN);
      case AWAITING_RESOLUTION -> Set.of(CLOSURE);
      default -> Set.of();
    };
  }

  /**
   * Whether this state allows modifications to issue.
   */
  public boolean isModifiable() {
    return this != CLOSURE && this != WITHDRAWN;
  }
}
