package com.supportticket.issue.service;

import com.supportticket.issue.entity.Issue;
import com.supportticket.issue.entity.IssueMessage;
import com.supportticket.issue.repository.IssueMessageRepository;
import com.supportticket.user.entity.AccountHolder;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;

@Service
@Transactional
public class MessageManagementService {

  private final IssueMessageRepository messageRepository;
  private final IssueManagementService issueService;

  public MessageManagementService(
      IssueMessageRepository messageRepository,
      IssueManagementService issueService
  ) {
    this.messageRepository = messageRepository;
    this.issueService = issueService;
  }

  /**
   * Add a message to an issue.
   */
  public IssueMessage addMessageToIssue(
      Long issueId,
      String messageText,
      AccountHolder authorUser,
      Long parentMessageId
  ) {
    Issue issue = issueService.retrieveIssueById(issueId);

    IssueMessage message = new IssueMessage();
    message.setIssue(issue);
    message.setMessageText(messageText);
    message.setAuthorUser(authorUser);
    message.setPostedAt(OffsetDateTime.now());
    message.setUpdatedAt(OffsetDateTime.now());

    if (parentMessageId != null) {
      IssueMessage parentMessage = messageRepository
          .findById(parentMessageId)
          .orElseThrow(
              () -> new EntityNotFoundException("Parent message not found: " + parentMessageId)
          );
      message.setParentMessage(parentMessage);
    }

    return messageRepository.save(message);
  }

  /**
   * Update a message.
   */
  public IssueMessage updateMessage(Long messageId, String newMessageText) {
    IssueMessage message = messageRepository
        .findById(messageId)
        .orElseThrow(
            () -> new EntityNotFoundException("Message not found: " + messageId)
        );

    message.setMessageText(newMessageText);
    message.setUpdatedAt(OffsetDateTime.now());

    return messageRepository.save(message);
  }

  /**
   * Delete a message.
   */
  public void deleteMessage(Long messageId) {
    IssueMessage message = messageRepository
        .findById(messageId)
        .orElseThrow(
            () -> new EntityNotFoundException("Message not found: " + messageId)
        );
    messageRepository.delete(message);
  }

  /**
   * Get messages for an issue.
   */
  @Transactional(readOnly = true)
  public Page<IssueMessage> getMessagesForIssue(Long issueId, Pageable pageable) {
    Issue issue = issueService.retrieveIssueById(issueId);
    return messageRepository.findByIssue(issue, pageable);
  }

  /**
   * Get message count for issue.
   */
  @Transactional(readOnly = true)
  public long getMessageCountForIssue(Long issueId) {
    Issue issue = issueService.retrieveIssueById(issueId);
    return messageRepository.countByIssue(issue);
  }
}
