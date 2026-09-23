package com.supportticket.user.api;

import com.supportticket.common.model.AccountType;
import com.supportticket.user.entity.AccountHolder;
import com.supportticket.user.repository.AccountHolderRepository;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {

  private final AccountHolderRepository accountHolderRepository;

  public UserController(AccountHolderRepository accountHolderRepository) {
    this.accountHolderRepository = accountHolderRepository;
  }

  @GetMapping
  public ResponseEntity<List<UserResponse>> listUsers() {
    List<UserResponse> users =
        accountHolderRepository
            .findByIsEnabledTrue(Pageable.unpaged())
            .map(UserResponse::from)
            .getContent();
    return ResponseEntity.ok(users);
  }

  public record UserResponse(
      Long userId, String loginName, String displayName, AccountType accountType) {
    public static UserResponse from(AccountHolder account) {
      return new UserResponse(
          account.getRecordId(),
          account.getLoginName(),
          account.getDisplayName(),
          account.getAccountType());
    }
  }
}
