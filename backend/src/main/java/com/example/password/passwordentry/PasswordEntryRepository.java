package com.example.password.passwordentry;

import com.example.password.account.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordEntryRepository extends JpaRepository<PasswordEntry, Long> {

    List<PasswordEntry> findAllByAccount(Account account);
}