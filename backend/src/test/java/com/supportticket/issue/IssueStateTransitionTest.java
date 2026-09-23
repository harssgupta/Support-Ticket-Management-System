package com.supportticket.issue;

import com.supportticket.common.model.IssueState;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Issue State Transition Validation")
class IssueStateTransitionTest {

  @Test
  @DisplayName("should allow NEWLY_OPENED to IN_WORK")
  void testValidTransition_NewlyOpenedToInWork() {
    IssueState from = IssueState.NEWLY_OPENED;
    IssueState to = IssueState.IN_WORK;

    assertTrue(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should allow NEWLY_OPENED to WITHDRAWN")
  void testValidTransition_NewlyOpenedToWithdrawn() {
    IssueState from = IssueState.NEWLY_OPENED;
    IssueState to = IssueState.WITHDRAWN;

    assertTrue(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should allow IN_WORK to AWAITING_RESOLUTION")
  void testValidTransition_InWorkToAwaitingResolution() {
    IssueState from = IssueState.IN_WORK;
    IssueState to = IssueState.AWAITING_RESOLUTION;

    assertTrue(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should allow IN_WORK to WITHDRAWN")
  void testValidTransition_InWorkToWithdrawn() {
    IssueState from = IssueState.IN_WORK;
    IssueState to = IssueState.WITHDRAWN;

    assertTrue(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should allow AWAITING_RESOLUTION to CLOSURE")
  void testValidTransition_AwaitingResolutionToClosure() {
    IssueState from = IssueState.AWAITING_RESOLUTION;
    IssueState to = IssueState.CLOSURE;

    assertTrue(from.canTransitionTo(to));
  }

  @ParameterizedTest
  @CsvSource({
      "NEWLY_OPENED,IN_WORK",
      "NEWLY_OPENED,WITHDRAWN",
      "IN_WORK,AWAITING_RESOLUTION",
      "IN_WORK,WITHDRAWN",
      "AWAITING_RESOLUTION,CLOSURE"
  })
  @DisplayName("should allow all 5 valid state transitions")
  void testAllValidTransitions(String fromStr, String toStr) {
    IssueState from = IssueState.valueOf(fromStr);
    IssueState to = IssueState.valueOf(toStr);

    assertTrue(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should reject CLOSURE to any state")
  void testInvalidTransition_ClosureToAnyState() {
    IssueState from = IssueState.CLOSURE;

    assertFalse(from.canTransitionTo(IssueState.NEWLY_OPENED));
    assertFalse(from.canTransitionTo(IssueState.IN_WORK));
    assertFalse(from.canTransitionTo(IssueState.AWAITING_RESOLUTION));
    assertFalse(from.canTransitionTo(IssueState.WITHDRAWN));
  }

  @Test
  @DisplayName("should reject WITHDRAWN to any state")
  void testInvalidTransition_WithdrawnToAnyState() {
    IssueState from = IssueState.WITHDRAWN;

    assertFalse(from.canTransitionTo(IssueState.NEWLY_OPENED));
    assertFalse(from.canTransitionTo(IssueState.IN_WORK));
    assertFalse(from.canTransitionTo(IssueState.AWAITING_RESOLUTION));
    assertFalse(from.canTransitionTo(IssueState.CLOSURE));
  }

  @Test
  @DisplayName("should reject AWAITING_RESOLUTION to NEWLY_OPENED")
  void testInvalidTransition_AwaitingResolutionToNewlyOpened() {
    IssueState from = IssueState.AWAITING_RESOLUTION;
    IssueState to = IssueState.NEWLY_OPENED;

    assertFalse(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should reject AWAITING_RESOLUTION to IN_WORK")
  void testInvalidTransition_AwaitingResolutionToInWork() {
    IssueState from = IssueState.AWAITING_RESOLUTION;
    IssueState to = IssueState.IN_WORK;

    assertFalse(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should reject AWAITING_RESOLUTION to WITHDRAWN")
  void testInvalidTransition_AwaitingResolutionToWithdrawn() {
    IssueState from = IssueState.AWAITING_RESOLUTION;
    IssueState to = IssueState.WITHDRAWN;

    assertFalse(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should reject IN_WORK to NEWLY_OPENED")
  void testInvalidTransition_InWorkToNewlyOpened() {
    IssueState from = IssueState.IN_WORK;
    IssueState to = IssueState.NEWLY_OPENED;

    assertFalse(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should reject IN_WORK to CLOSURE")
  void testInvalidTransition_InWorkToClosure() {
    IssueState from = IssueState.IN_WORK;
    IssueState to = IssueState.CLOSURE;

    assertFalse(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should reject NEWLY_OPENED to AWAITING_RESOLUTION")
  void testInvalidTransition_NewlyOpenedToAwaitingResolution() {
    IssueState from = IssueState.NEWLY_OPENED;
    IssueState to = IssueState.AWAITING_RESOLUTION;

    assertFalse(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("should reject NEWLY_OPENED to CLOSURE")
  void testInvalidTransition_NewlyOpenedToClosure() {
    IssueState from = IssueState.NEWLY_OPENED;
    IssueState to = IssueState.CLOSURE;

    assertFalse(from.canTransitionTo(to));
  }

  @Test
  @DisplayName("CLOSURE state should not be modifiable")
  void testReadOnlyState_Closure() {
    IssueState state = IssueState.CLOSURE;

    assertFalse(state.isModifiable());
  }

  @Test
  @DisplayName("WITHDRAWN state should not be modifiable")
  void testReadOnlyState_Withdrawn() {
    IssueState state = IssueState.WITHDRAWN;

    assertFalse(state.isModifiable());
  }

  @Test
  @DisplayName("IN_WORK state should be modifiable")
  void testModifiableState_InWork() {
    IssueState state = IssueState.IN_WORK;

    assertTrue(state.isModifiable());
  }

  @Test
  @DisplayName("getAllowedTransitions should return correct set")
  void testGetAllowedTransitions() {
    IssueState state = IssueState.NEWLY_OPENED;
    var allowed = state.getAllowedTransitions();

    assertTrue(allowed.contains(IssueState.IN_WORK));
    assertTrue(allowed.contains(IssueState.WITHDRAWN));
    assertFalse(allowed.contains(IssueState.AWAITING_RESOLUTION));
    assertFalse(allowed.contains(IssueState.CLOSURE));
  }
}
