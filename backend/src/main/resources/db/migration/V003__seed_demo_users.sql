-- V003__seed_demo_users.sql
-- Seed demo accounts for local development/testing
-- Password for both accounts: password123 (BCrypt hashed)

INSERT INTO account_holder (login_name, email_address, pwd_hash, display_name, account_type, is_enabled)
VALUES
    ('john', 'john@example.com', '$2b$12$UEgoDu6HA8dBq80bfac1BuqGWj9hf7OqRyr8p2slBhB/yhmEHyl6m', 'John Doe', 'SUPPORT_AGENT', true),
    ('jane', 'jane@example.com', '$2b$12$UEgoDu6HA8dBq80bfac1BuqGWj9hf7OqRyr8p2slBhB/yhmEHyl6m', 'Jane Smith', 'SUPERVISOR', true);
