package com.supportticket.issue.repository;

import com.supportticket.issue.entity.Issue;
import com.supportticket.issue.entity.StateChangeLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StateChangeLogRepository extends JpaRepository<StateChangeLog, Long> {

  Page<StateChangeLog> findByIssueOrderByChangeTimestampDesc(Issue issue, Pageable pageable);

  long countByIssue(Issue issue);
}
