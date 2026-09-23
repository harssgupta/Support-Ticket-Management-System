package com.supportticket.issue.api;

import com.supportticket.issue.entity.IssueMessage;
import com.supportticket.issue.service.MessageManagementService;
import com.supportticket.user.entity.AccountHolder;
import com.supportticket.user.service.AuthenticationService;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/issues/{issueId}/messages")
public class MessageController {

  private final MessageManagementService messageService;
  private final AuthenticationService authService;

  public MessageController(
      MessageManagementService messageService, AuthenticationService authService) {
    this.messageService = messageService;
    this.authService = authService;
  }

  @PostMapping
  public ResponseEntity<MessageResponse> addMessage(
      @PathVariable Long issueId,
      @RequestBody AddMessageRequest request,
      @RequestHeader(value = "X-User-ID", required = false, defaultValue = "1") Long userId) {
    AccountHolder author = authService.getAccountById(userId);
    IssueMessage message =
        messageService.addMessageToIssue(
            issueId, request.messageText(), author, request.parentMessageId());
    return ResponseEntity.status(HttpStatus.CREATED).body(MessageResponse.from(message));
  }

  @GetMapping
  public ResponseEntity<List<MessageResponse>> getMessages(
      @PathVariable Long issueId, Pageable pageable) {
    Page<IssueMessage> messages = messageService.getMessagesForIssue(issueId, pageable);
    return ResponseEntity.ok(messages.map(MessageResponse::from).getContent());
  }

  public record AddMessageRequest(String messageText, Long parentMessageId) {}

  public record MessageResponse(
      Long msgId,
      Long issueId,
      Long authorUserId,
      String authorName,
      String messageText,
      Long parentMsgId,
      String postedAt,
      String updatedAt
  ) {
    public static MessageResponse from(IssueMessage message) {
      return new MessageResponse(
          message.getMsgId(),
          message.getIssue().getIssueId(),
          message.getAuthorUser().getRecordId(),
          message.getAuthorUser().getDisplayName(),
          message.getMessageText(),
          message.getParentMessage() != null ? message.getParentMessage().getMsgId() : null,
          message.getPostedAt().toString(),
          message.getUpdatedAt().toString()
      );
    }
  }
}
