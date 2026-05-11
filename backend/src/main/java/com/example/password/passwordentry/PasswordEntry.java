package com.example.password.passwordentry;

import com.example.password.account.Account;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "password_entry")
@Getter
@Setter
@NoArgsConstructor
public class PasswordEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PasswordCategory category = PasswordCategory.INNE;

    @Column(nullable = false, name = "encrypted_password", columnDefinition = "bytea")
    private byte[] encryptedPassword;

    @Column(nullable = false, name = "iv", columnDefinition = "bytea")
    private byte[] iv;

    public PasswordEntry(Account account, String name, String username, byte[] encryptedPassword, byte[] iv) {
        this.account = account;
        this.name = name;
        this.username = username;
        this.encryptedPassword = encryptedPassword;
        this.iv = iv;
    }
}