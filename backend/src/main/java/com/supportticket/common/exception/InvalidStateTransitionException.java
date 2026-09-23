package com.supportticket.common.exception;

import com.supportticket.common.model.IssueState;
import java.util.Set;

public class InvalidStateTransitionException extends RuntimeException {

  private final IssueState currentState;
  private final IssueState requestedState;
  private final Set<IssueState> allowedTransitions;

  public InvalidStateTransitionException(
      IssueState currentState,
      IssueState requestedState,
      Set<IssueState> allowedTransitions
  ) {
    super(
        String.format(
            "Cannot transition from %s to %s. Allowed transitions: %s",
            currentState, requestedState, allowedTransitions
        )
    );
    this.currentState = currentState;
    this.requestedState = requestedState;
    this.allowedTransitions = allowedTransitions;
  }

  public IssueState getCurrentState() {
    return currentState;
  }

  public IssueState getRequestedState() {
    return requestedState;
  }

  public Set<IssueState> getAllowedTransitions() {
    return allowedTransitions;
  }
}
