-- V004__seed_additional_users.sql
-- Additional accounts so issues can be assigned to different people

INSERT INTO account_holder (login_name, email_address, pwd_hash, display_name, account_type, is_enabled)
VALUES
    ('sarah', 'sarah@example.com', '$2b$12$xelvOANGukiXcpwXtxbnWe3umzsWRc7DUgLxEJ6uF.yN3RcOcvfjq', 'Sarah Connor', 'SUPPORT_AGENT', true),
    ('mike', 'mike@example.com', '$2b$12$8jY0yM.DlKl7OcM0GwHzGOFYBChO1I5f7umXnJDkniYtlLlcNbWBy', 'Mike Johnson', 'REQUESTER', true),
    ('admin', 'admin@example.com', '$2b$12$sacwdespEspJ6tmslUrObe.5b/atR/ypJvrGdqn2H44x7clAmSqFC', 'System Admin', 'SYSTEM_ADMIN', true);
