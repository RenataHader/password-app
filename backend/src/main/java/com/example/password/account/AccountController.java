package com.example.password.account;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AccountController {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountController(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> data) {

        String name = data.get("name");
        String surname = data.get("surname");
        String email = data.get("email");
        String password = data.get("password");

        if (
                name == null || name.isBlank() ||
                surname == null || surname.isBlank() ||
                email == null || email.isBlank() ||
                password == null || password.isBlank()
        ) {
            return ResponseEntity.badRequest().body("Imię, nazwisko, email i hasło są wymagane!");
        }

        if (accountRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Użytkownik już istnieje!");
        }

        String passwordHash = passwordEncoder.encode(password);

        Account account = new Account(name, surname, email, passwordHash);
        accountRepository.save(account);

        return ResponseEntity.status(HttpStatus.CREATED).body("Zarejestrowano pomyślnie!");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data, HttpSession session) {

        String email = data.get("email");
        String password = data.get("password");

        Optional<Account> accountOpt = accountRepository.findByEmail(email);

        if (accountOpt.isPresent() && passwordEncoder.matches(password, accountOpt.get().getPasswordHash())) {

            Account account = accountOpt.get();
            session.setAttribute("userId", account.getId());

            return ResponseEntity.ok("Zalogowano pomyślnie");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Niepoprawny email lub hasło!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpSession session){

        Long userId = (Long) session.getAttribute("userId");

        if(userId == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
        }

        Optional<Account> accountOpt = accountRepository.findById(userId);

        if(accountOpt.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nie znaleziono użytkownika");
        }

        Account account = accountOpt.get();

        return ResponseEntity.ok(buildUserResponse(account));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, String> data, HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");

        if(userId == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
        }

        Optional<Account> accountOpt = accountRepository.findById(userId);

        if(accountOpt.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nie znaleziono użytkownika");
        }

        String name = data.get("name");
        String surname = data.get("surname");
        String email = data.get("email");

        if (name == null || name.isBlank() || surname == null || surname.isBlank() || email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Imię, nazwisko i email są wymagane");
        }

        Account account = accountOpt.get();

        Optional<Account> accountWithEmail = accountRepository.findByEmail(email);

        if (accountWithEmail.isPresent() && !accountWithEmail.get().getId().equals(account.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ten email jest już zajęty");
        }

        account.setName(name);
        account.setSurname(surname);
        account.setEmail(email);

        accountRepository.save(account);

        return ResponseEntity.ok(buildUserResponse(account));
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changeManagerPassword(@RequestBody Map<String, String> data, HttpSession session){

        Long userId = (Long) session.getAttribute("userId");

        if(userId == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
        }

        Optional<Account> accountOpt = accountRepository.findById(userId);

        if(accountOpt.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nie znaleziono użytkownika");
        }

        String currentPassword = data.get("currentPassword");
        String newPassword = data.get("newPassword");

        if(currentPassword == null || currentPassword.isBlank() || newPassword == null || newPassword.isBlank()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Aktualne hasło i nowe hasło są wymagane");
        }

        Account account = accountOpt.get();

        if (!passwordEncoder.matches(currentPassword, account.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Aktualne hasło jest nieprawidłowe");
        }

        if (passwordEncoder.matches(newPassword, account.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nowe hasło nie może być takie samo jak aktualne");
        }

        account.setPasswordHash(passwordEncoder.encode(newPassword));
        account.setPasswordChangedAt(LocalDate.now());

        accountRepository.save(account);

        return ResponseEntity.ok(buildUserResponse(account));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("Wylogowano");
    }

    private Map<String, Object> buildUserResponse(Account account) {
        LocalDate passwordNextChangeAt = account.getPasswordChangedAt().plusMonths(6);
        long daysToPasswordChange = ChronoUnit.DAYS.between(LocalDate.now(), passwordNextChangeAt);
        boolean passwordChangeRequired = !passwordNextChangeAt.isAfter(LocalDate.now());

        return Map.of(
                "userId", account.getId(),
                "name", account.getName(),
                "surname", account.getSurname(),
                "email", account.getEmail(),
                "passwordChangedAt", account.getPasswordChangedAt(),
                "passwordNextChangeAt", passwordNextChangeAt,
                "daysToPasswordChange", daysToPasswordChange,
                "passwordChangeRequired", passwordChangeRequired
        );
    }
}