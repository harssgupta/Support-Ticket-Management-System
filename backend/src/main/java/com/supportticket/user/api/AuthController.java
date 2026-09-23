package com.supportticket.user.api;

import com.supportticket.common.model.AccountType;
import com.supportticket.user.entity.AccountHolder;
import com.supportticket.user.service.AuthenticationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthenticationService authService;

  public AuthController(AuthenticationService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    AccountHolder account = authService.authenticate(request.loginName(), request.password());
    return ResponseEntity.ok(LoginResponse.from(account));
  }

  public record LoginRequest(String loginName, String password) {}

  public record LoginResponse(
      Long userId,
      String loginName,
      String displayName,
      String emailAddress,
      AccountType accountType
  ) {
    public static LoginResponse from(AccountHolder account) {
      return new LoginResponse(
          account.getRecordId(),
          account.getLoginName(),
          account.getDisplayName(),
          account.getEmailAddress(),
          account.getAccountType()
      );
    }
  }
}
