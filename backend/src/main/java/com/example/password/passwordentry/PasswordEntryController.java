package com.example.password.passwordentry;

import com.example.password.account.Account;
import com.example.password.account.AccountRepository;
import com.example.password.config.EncryptionUtil;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/passwords")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PasswordEntryController {

    private final PasswordEntryRepository passwordEntryRepository;
    private final AccountRepository accountRepository;
    private final EncryptionUtil encryptionUtil;

    public PasswordEntryController(PasswordEntryRepository passwordEntryRepository, AccountRepository accountRepository, EncryptionUtil encryptionUtil) {
        this.passwordEntryRepository = passwordEntryRepository;
        this.accountRepository = accountRepository;
        this.encryptionUtil = encryptionUtil;
    }

    @GetMapping
    public ResponseEntity<?> getPasswords(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
        }

        Optional<Account> accountOpt = accountRepository.findById(userId);

        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nie znaleziono użytkownika");
        }

        Account account = accountOpt.get();
        List<PasswordEntry> entries = passwordEntryRepository.findAllByAccount(account);

        List<Map<String, Object>> result = entries.stream().map(entry -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", entry.getId());
            map.put("name", entry.getName());
            map.put("link", entry.getLink());
            map.put("login", entry.getLogin());
            map.put("category", entry.getCategory());

            try {
                String decryptedPassword = encryptionUtil.decrypt(entry.getEncryptedPassword(), entry.getIv());
                map.put("password", decryptedPassword);
            } catch (Exception e) {
                map.put("password", "Błąd deszyfrowania");
                map.put("error", e.getMessage());
            }

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> addPassword(@RequestBody Map<String, String> data, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
        }

        Optional<Account> accountOpt = accountRepository.findById(userId);

        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nie znaleziono użytkownika");
        }

        String site = data.get("site");
        String login = data.get("login");
        String password = data.get("password");

        if (
                site == null || site.isBlank() ||
                login == null || login.isBlank() ||
                password == null || password.isBlank()
        ) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nazwa, login i hasło są wymagane");
        }

        try {
            Account account = accountOpt.get();

            byte[] iv = encryptionUtil.generateIv();
            byte[] encrypted = encryptionUtil.encrypt(password, iv);

            PasswordEntry entry = new PasswordEntry();
            entry.setAccount(account);
            entry.setName(site);

            String link = data.get("link");
            entry.setLink(link == null || link.isBlank() ? null : link);

            entry.setLogin(login);

            String categoryStr = data.getOrDefault("category", "INNE");

            try {
                entry.setCategory(PasswordCategory.valueOf(categoryStr));
            } catch (IllegalArgumentException e) {
                entry.setCategory(PasswordCategory.INNE);
            }

            entry.setEncryptedPassword(encrypted);
            entry.setIv(iv);

            passwordEntryRepository.save(entry);

            return ResponseEntity.ok("Hasło zaszyfrowane i zapisane!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Błąd szyfrowania: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePassword(@PathVariable Long id, HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
        }

        Optional<Account> accountOpt = accountRepository.findById(userId);

        if (accountOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nie znaleziono użytkownika");
        }

        Account account = accountOpt.get();

        Optional<PasswordEntry> entryOpt = passwordEntryRepository.findByIdAndAccount(id, account);

        if (entryOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nie znaleziono hasła");
        }

        passwordEntryRepository.delete(entryOpt.get());

        return ResponseEntity.ok("Usunięto");
    }
}