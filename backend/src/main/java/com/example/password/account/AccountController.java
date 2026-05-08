package com.example.password.account;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountRepository accountRepository;

    public AccountController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");

        if (accountRepository.existsByEmail(email)) {
            return "Użytkownik już istnieje!";
        }

        Account account = new Account(email, password);
        accountRepository.save(account);
        return "Zarejestrowano pomyślnie!";
    }
}