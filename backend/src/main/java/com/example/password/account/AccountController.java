package com.example.password.account;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountController(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public String register(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");

        if (accountRepository.existsByEmail(email)) {
            return "Użytkownik już istnieje!";
        }

        String passwordHash = passwordEncoder.encode(password);

        Account account = new Account(email, passwordHash);
        accountRepository.save(account);

        return "Zarejestrowano pomyślnie!";
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");

        Optional<Account> accountOpt = accountRepository.findByEmail(email);

        if (accountOpt.isPresent() && passwordEncoder.matches(password, accountOpt.get().getPasswordHash())) {
            return ResponseEntity.ok(Map.of(
                    "message", "Zalogowano pomyślnie",
                    "userId", accountOpt.get().getId(),
                    "email", accountOpt.get().getEmail()
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Niepoprawny email lub hasło!");
        }
    }
}