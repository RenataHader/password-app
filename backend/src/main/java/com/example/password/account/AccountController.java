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
import java.time.LocalDateTime;
import java.security.SecureRandom;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AccountController {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SessionAccountService sessionAccountService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int MAX_LOGIN_CODE_ATTEMPTS = 3;
    private static final int MAX_LOGIN_PASSWORD_ATTEMPTS = 5;
    private static final int LOGIN_LOCK_MINUTES = 10;

    public AccountController(AccountRepository accountRepository, PasswordEncoder passwordEncoder, JavaMailSender mailSender, SessionAccountService sessionAccountService) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.sessionAccountService = sessionAccountService;
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

        if (!isStrongAccountPassword(password)) {
            return ResponseEntity.badRequest().body("Hasło musi mieć min. 8 znaków, 1 wielką literę, 1 cyfrę i 1 znak specjalny");
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

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email i hasło są wymagane");
        }

        LocalDateTime loginLockedUntil = (LocalDateTime) session.getAttribute("loginLockedUntil");

        if (loginLockedUntil != null && LocalDateTime.now().isBefore(loginLockedUntil)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Za dużo nieudanych prób logowania. Spróbuj ponownie później.");
        }

        if (loginLockedUntil != null && LocalDateTime.now().isAfter(loginLockedUntil)) {
            session.removeAttribute("loginLockedUntil");
            session.setAttribute("loginPasswordAttempts", 0);
        }

        Optional<Account> accountOpt = accountRepository.findByEmail(email);

        if (accountOpt.isPresent() && passwordEncoder.matches(password, accountOpt.get().getPasswordHash())) {

            session.removeAttribute("loginPasswordAttempts");
            session.removeAttribute("loginLockedUntil");

            Account account = accountOpt.get();

            String code = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

            System.out.println("DEV LOGIN CODE dla " + account.getEmail() + ": " + code);

            session.setAttribute("pendingUserId", account.getId());
            session.setAttribute("loginCode", code);
            session.setAttribute("loginCodeExpiresAt", LocalDateTime.now().plusMinutes(5));
            session.setAttribute("loginCodeAttempts", 0);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(account.getEmail());
            message.setSubject("Kod logowania do PassManager");
            message.setText("Twój kod logowania to: " + code + "\nKod jest ważny przez 5 minut.");

            mailSender.send(message);

            return ResponseEntity.ok("Kod został wysłany na email");
        }

        Integer attempts = (Integer) session.getAttribute("loginPasswordAttempts");

        if (attempts == null) {
            attempts = 0;
        }

        attempts++;
        session.setAttribute("loginPasswordAttempts", attempts);

        if (attempts >= MAX_LOGIN_PASSWORD_ATTEMPTS) {
            session.setAttribute("loginLockedUntil", LocalDateTime.now().plusMinutes(LOGIN_LOCK_MINUTES));
            session.setAttribute("loginPasswordAttempts", 0);

            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Przekroczono limit prób logowania. Spróbuj ponownie za 10 minut.");
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Niepoprawny email lub hasło!");
    }

    @PostMapping("/verify-login-code")
    public ResponseEntity<?> verifyLoginCode(@RequestBody Map<String, String> data, HttpSession session) {

        String code = data.get("code");

        Long pendingUserId = (Long) session.getAttribute("pendingUserId");
        String loginCode = (String) session.getAttribute("loginCode");
        LocalDateTime loginCodeExpiresAt = (LocalDateTime) session.getAttribute("loginCodeExpiresAt");

        Integer loginCodeAttempts = (Integer) session.getAttribute("loginCodeAttempts");

        if (loginCodeAttempts == null) {
            loginCodeAttempts = 0;
        }

        if (pendingUserId == null || loginCode == null || loginCodeExpiresAt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Brak rozpoczętego logowania");
        }

        if (LocalDateTime.now().isAfter(loginCodeExpiresAt)) {
            session.removeAttribute("pendingUserId");
            session.removeAttribute("loginCode");
            session.removeAttribute("loginCodeExpiresAt");
            session.removeAttribute("loginCodeAttempts");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Kod wygasł");
        }

        if (code == null || code.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Kod jest wymagany");
        }

        if (!code.equals(loginCode)) {
            loginCodeAttempts++;
            session.setAttribute("loginCodeAttempts", loginCodeAttempts);

            if (loginCodeAttempts >= MAX_LOGIN_CODE_ATTEMPTS) {
                session.removeAttribute("pendingUserId");
                session.removeAttribute("loginCode");
                session.removeAttribute("loginCodeExpiresAt");
                session.removeAttribute("loginCodeAttempts");

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Przekroczono limit prób. Zaloguj się ponownie.");
            }

            int attemptsLeft = MAX_LOGIN_CODE_ATTEMPTS - loginCodeAttempts;

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Niepoprawny kod. Pozostało prób: " + attemptsLeft);
        }

        session.setAttribute("userId", pendingUserId);

        session.removeAttribute("pendingUserId");
        session.removeAttribute("loginCode");
        session.removeAttribute("loginCodeExpiresAt");
        session.removeAttribute("loginCodeAttempts");

        return ResponseEntity.ok("Zalogowano pomyślnie");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpSession session){

        Optional<Account> accountOpt = sessionAccountService.getLoggedAccount(session);

        if(accountOpt.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
        }

        Account account = accountOpt.get();

        return ResponseEntity.ok(buildUserResponse(account));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, String> data, HttpSession session) {

        Optional<Account> accountOpt = sessionAccountService.getLoggedAccount(session);

        if(accountOpt.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
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

        Optional<Account> accountOpt = sessionAccountService.getLoggedAccount(session);

        if(accountOpt.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Nie jesteś zalogowany");
        }

        String currentPassword = data.get("currentPassword");
        String newPassword = data.get("newPassword");

        if(currentPassword == null || currentPassword.isBlank() || newPassword == null || newPassword.isBlank()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Aktualne hasło i nowe hasło są wymagane");
        }

        if (!isStrongAccountPassword(newPassword)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Nowe hasło musi mieć min. 8 znaków, 1 wielką literę, 1 cyfrę i 1 znak specjalny");
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

    private boolean isStrongAccountPassword(String password) {
        return password != null &&
                password.matches("^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$");
    }
}