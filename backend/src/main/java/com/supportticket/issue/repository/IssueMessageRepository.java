package com.supportticket.issue.repository;

import com.supportticket.issue.entity.Issue;
import com.supportticket.issue.entity.IssueMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IssueMessageRepository extends JpaRepository<IssueMessage, Long> {

  Page<IssueMessage> findByIssue(Issue issue, Pageable pageable);

  List<IssueMessage> findByParentMessageIsNull(Issue issue);

  long countByIssue(Issue issue);
}
