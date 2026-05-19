CREATE TABLE account (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE password_entry (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    link VARCHAR(255) NULL,
    login VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'INNE',
    encrypted_password BYTEA NOT NULL,
    iv BYTEA NOT NULL,

    CONSTRAINT fk_password_entry_account
        FOREIGN KEY (account_id)
        REFERENCES account(id)
        ON DELETE CASCADE
);