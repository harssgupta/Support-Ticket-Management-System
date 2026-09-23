-- V001__init_core_tables.sql
-- Initial database schema for Support Ticket Hub
-- Date: 2026-09-23

CREATE TABLE account_holder (
    record_id BIGSERIAL PRIMARY KEY,
    login_name VARCHAR(50) UNIQUE NOT NULL,
    email_address VARCHAR(100) UNIQUE NOT NULL,
    pwd_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    account_type VARCHAR(20) NOT NULL
        CHECK (account_type IN ('REQUESTER', 'SUPPORT_AGENT', 'SUPERVISOR', 'SYSTEM_ADMIN')),
    is_enabled BOOLEAN DEFAULT true,
    created_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    modified_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_account_holder_login ON account_holder(login_name);
CREATE INDEX idx_account_holder_email ON account_holder(email_address);

COMMENT ON TABLE account_holder IS 'User accounts for the ticket system';
COMMENT ON COLUMN account_holder.account_type IS 'User role/permission level';
COMMENT ON COLUMN account_holder.is_enabled IS 'Whether account is active';
