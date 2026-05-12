package com.example.password.passwordentry;

import com.example.password.account.Account;
import com.example.password.account.AccountRepository;
import com.example.password.config.EncryptionUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/passwords")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordEntryController {

    private final PasswordEntryRepository passwordEntryRepository;
    private final AccountRepository accountRepository;
    private final EncryptionUtil encryptionUtil;

    public PasswordEntryController(PasswordEntryRepository passwordEntryRepository,
                                   AccountRepository accountRepository,
                                   EncryptionUtil encryptionUtil) {
        this.passwordEntryRepository = passwordEntryRepository;
        this.accountRepository = accountRepository;
        this.encryptionUtil = encryptionUtil;
    }

    @GetMapping("/{userId}")
    public List<Map<String, Object>> getPasswords(@PathVariable Long userId) {
        Account account = accountRepository.findById(userId).orElseThrow();
        List<PasswordEntry> entries = passwordEntryRepository.findAllByAccount(account);

        return entries.stream().map(entry -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", entry.getId());
            map.put("name", entry.getName());
            map.put("username", entry.getUsername());
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
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> addPassword(@PathVariable Long userId, @RequestBody Map<String, String> data) {
        try {
            Account account = accountRepository.findById(userId).orElseThrow();
            byte[] iv = encryptionUtil.generateIv();
            byte[] encrypted = encryptionUtil.encrypt(data.get("password"), iv);

            PasswordEntry entry = new PasswordEntry();
            entry.setAccount(account);
            entry.setName(data.get("site"));
            entry.setUsername(data.get("login"));

            String categoryStr = data.get("category").toUpperCase().replace(" ", "_");
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
    public ResponseEntity<?> deletePassword(@PathVariable Long id) {
        passwordEntryRepository.deleteById(id);
        return ResponseEntity.ok("Usunięto");
    }
}