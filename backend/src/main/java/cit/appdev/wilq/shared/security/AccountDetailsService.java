package cit.appdev.wilq.shared.security;

import java.util.UUID;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import cit.appdev.wilq.account.AccountRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String id) {
        return accountRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new UsernameNotFoundException("Account not found with id: " + id));

    }
}