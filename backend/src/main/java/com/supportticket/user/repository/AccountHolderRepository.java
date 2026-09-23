package com.supportticket.user.repository;

import com.supportticket.common.model.AccountType;
import com.supportticket.user.entity.AccountHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AccountHolderRepository extends JpaRepository<AccountHolder, Long> {

  Optional<AccountHolder> findByLoginName(String loginName);

  Optional<AccountHolder> findByEmailAddress(String emailAddress);

  Page<AccountHolder> findByIsEnabledTrue(Pageable pageable);

  Page<AccountHolder> findByAccountType(AccountType accountType, Pageable pageable);

  long countByIsEnabledTrue();
}
