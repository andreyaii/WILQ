package cit.appdev.wilq.account;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import cit.appdev.wilq.account.entity.Account;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
}
