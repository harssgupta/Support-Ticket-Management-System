package com.supportticket.user.service;

import com.supportticket.user.entity.AccountHolder;
import com.supportticket.user.repository.AccountHolderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthenticationService {

  private final AccountHolderRepository accountHolderRepository;
  private final PasswordEncoder passwordEncoder;

  public AuthenticationService(
      AccountHolderRepository accountHolderRepository,
      PasswordEncoder passwordEncoder
  ) {
    this.accountHolderRepository = accountHolderRepository;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Authenticate user by login name and password.
   */
  public AccountHolder authenticate(String loginName, String rawPassword) {
    AccountHolder account = accountHolderRepository
        .findByLoginName(loginName)
        .orElseThrow(
            () -> new EntityNotFoundException("Account not found: " + loginName)
        );

    if (!account.getIsEnabled()) {
      throw new IllegalStateException("Account is disabled: " + loginName);
    }

    if (!passwordEncoder.matches(rawPassword, account.getPasswordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    return account;
  }

  /**
   * Get user by ID.
   */
  @Transactional(readOnly = true)
  public AccountHolder getAccountById(Long recordId) {
    return accountHolderRepository
        .findById(recordId)
        .orElseThrow(
            () -> new EntityNotFoundException("Account not found with ID: " + recordId)
        );
  }

  /**
   * Get user by login name.
   */
  @Transactional(readOnly = true)
  public AccountHolder getAccountByLoginName(String loginName) {
    return accountHolderRepository
        .findByLoginName(loginName)
        .orElseThrow(
            () -> new EntityNotFoundException("Account not found: " + loginName)
        );
  }
}
