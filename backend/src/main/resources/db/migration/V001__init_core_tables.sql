-- V001__init_core_tables.sql
-- Initial database schema for Support Ticket Hub
-- Date: 2026-09-23

CREATE TABLE account_holder (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    login_name VARCHAR(50) UNIQUE NOT NULL,
    email_address VARCHAR(100) UNIQUE NOT NULL,
    pwd_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    account_type VARCHAR(20) NOT NULL
        CHECK (account_type IN ('REQUESTER', 'SUPPORT_AGENT', 'SUPERVISOR', 'SYSTEM_ADMIN')),
    is_enabled BOOLEAN DEFAULT true,
    created_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_account_holder_login ON account_holder(login_name);
CREATE INDEX idx_account_holder_email ON account_holder(email_address);
