package com.example.password.account;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SessionAccountService {

    private final AccountRepository accountRepository;

    public SessionAccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public Optional<Account> getLoggedAccount(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return Optional.empty();
        }

        return accountRepository.findById(userId);
    }
}