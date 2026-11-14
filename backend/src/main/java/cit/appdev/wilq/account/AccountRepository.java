package cit.appdev.wilq.account;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cit.appdev.wilq.account.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    // Login lookup by username
    Optional<Account> findByUsername(String username);
}
