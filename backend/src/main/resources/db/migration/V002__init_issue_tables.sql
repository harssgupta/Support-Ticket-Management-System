-- V002__init_issue_tables.sql
-- Issue/ticket core tables
-- Date: 2026-09-23

CREATE TABLE issue (
    issue_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_key VARCHAR(20) UNIQUE NOT NULL,
    subject_line VARCHAR(255) NOT NULL,
    problem_description TEXT,
    severity_level VARCHAR(20) NOT NULL
        CHECK (severity_level IN ('TRIVIAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    current_state VARCHAR(20) NOT NULL
        CHECK (current_state IN ('NEWLY_OPENED', 'IN_WORK', 'AWAITING_RESOLUTION', 'CLOSURE', 'WITHDRAWN')),
    reporting_user_id BIGINT NOT NULL,
    assigned_to_user_id BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    first_response_timestamp DATETIME,
    resolved_timestamp DATETIME,
    concurrency_version BIGINT DEFAULT 1,
    FOREIGN KEY (reporting_user_id) REFERENCES account_holder(record_id),
    FOREIGN KEY (assigned_to_user_id) REFERENCES account_holder(record_id),
    CHECK ((current_state != 'CLOSURE') OR (assigned_to_user_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_issue_state_severity ON issue(current_state, severity_level);
CREATE INDEX idx_issue_assigned_to ON issue(assigned_to_user_id);
CREATE INDEX idx_issue_created_at ON issue(created_at DESC);
CREATE INDEX idx_issue_reporter ON issue(reporting_user_id);

-- Issue state transition audit
CREATE TABLE state_change_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    transition_from_state VARCHAR(20) NOT NULL,
    transition_to_state VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT NOT NULL,
    change_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transition_reason TEXT,
    FOREIGN KEY (issue_id) REFERENCES issue(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES account_holder(record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_state_change_log_issue ON state_change_log(issue_id);
CREATE INDEX idx_state_change_log_timestamp ON state_change_log(change_timestamp DESC);

-- Issue message threads
CREATE TABLE issue_message (
    msg_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    author_user_id BIGINT NOT NULL,
    message_text TEXT NOT NULL,
    parent_msg_id BIGINT,
    posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    concurrency_version BIGINT DEFAULT 1,
    FOREIGN KEY (issue_id) REFERENCES issue(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (author_user_id) REFERENCES account_holder(record_id),
    FOREIGN KEY (parent_msg_id) REFERENCES issue_message(msg_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_issue_message_issue ON issue_message(issue_id);
CREATE INDEX idx_issue_message_author ON issue_message(author_user_id);
CREATE INDEX idx_issue_message_parent ON issue_message(parent_msg_id);
CREATE INDEX idx_issue_message_posted_at ON issue_message(posted_at DESC);

-- File attachments
CREATE TABLE attached_file (
    file_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT,
    msg_id BIGINT,
    file_name VARCHAR(255) NOT NULL,
    stored_file_uri TEXT NOT NULL,
    file_byte_size BIGINT NOT NULL,
    mime_type_code VARCHAR(50),
    uploaded_by_user_id BIGINT NOT NULL,
    upload_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issue(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (msg_id) REFERENCES issue_message(msg_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES account_holder(record_id),
    CHECK ((issue_id IS NOT NULL AND msg_id IS NULL) OR (issue_id IS NULL AND msg_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_attached_file_issue ON attached_file(issue_id);
CREATE INDEX idx_attached_file_message ON attached_file(msg_id);
CREATE INDEX idx_attached_file_uploaded_by ON attached_file(uploaded_by_user_id);

-- Issue watchers
CREATE TABLE issue_follower (
    follower_relationship_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    following_user_id BIGINT NOT NULL,
    followed_since DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_issue_follower (issue_id, following_user_id),
    FOREIGN KEY (issue_id) REFERENCES issue(issue_id) ON DELETE CASCADE,
    FOREIGN KEY (following_user_id) REFERENCES account_holder(record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_issue_follower_issue ON issue_follower(issue_id);
CREATE INDEX idx_issue_follower_user ON issue_follower(following_user_id);
