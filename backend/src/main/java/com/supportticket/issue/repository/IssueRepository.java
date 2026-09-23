package com.supportticket.issue.repository;

import com.supportticket.common.model.IssueSeverity;
import com.supportticket.common.model.IssueState;
import com.supportticket.issue.entity.Issue;
import com.supportticket.user.entity.AccountHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

  Optional<Issue> findByIssueKey(String issueKey);

  Page<Issue> findByCurrentStateAndSeverityLevel(
      IssueState currentState,
      IssueSeverity severityLevel,
      Pageable pageable
  );

  Page<Issue> findByAssignedToUser(AccountHolder assignedToUser, Pageable pageable);

  Page<Issue> findByReportingUser(AccountHolder reportingUser, Pageable pageable);

  Page<Issue> findByCurrentState(IssueState currentState, Pageable pageable);

  long countByCurrentState(IssueState currentState);

  long countByAssignedToUserAndCurrentState(AccountHolder assignedToUser, IssueState state);

  @Query(
      "SELECT i FROM Issue i WHERE "
          + "(LOWER(i.subjectLine) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR "
          + "LOWER(i.problemDescription) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) "
          + "AND (:state IS NULL OR i.currentState = :state) "
          + "AND (:severity IS NULL OR i.severityLevel = :severity) "
  )
  Page<Issue> searchIssues(
      @Param("searchTerm") String searchTerm,
      @Param("state") IssueState state,
      @Param("severity") IssueSeverity severity,
      Pageable pageable
  );
}
