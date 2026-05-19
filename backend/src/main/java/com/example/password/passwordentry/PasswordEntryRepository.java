package com.example.password.passwordentry;

import com.example.password.account.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordEntryRepository extends JpaRepository<PasswordEntry, Long> {

    List<PasswordEntry> findAllByAccount(Account account);
    Optional<PasswordEntry> findByIdAndAccount(Long id, Account account);
}