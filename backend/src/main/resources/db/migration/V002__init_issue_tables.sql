-- V002__init_issue_tables.sql
-- Issue/ticket core tables
-- Date: 2026-09-23

CREATE TABLE issue (
    issue_id BIGSERIAL PRIMARY KEY,
    issue_key VARCHAR(20) UNIQUE NOT NULL,
    subject_line VARCHAR(255) NOT NULL,
    problem_description TEXT,
    severity_level VARCHAR(20) NOT NULL
        CHECK (severity_level IN ('TRIVIAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    current_state VARCHAR(20) NOT NULL
        CHECK (current_state IN ('NEWLY_OPENED', 'IN_WORK', 'AWAITING_RESOLUTION', 'CLOSURE', 'WITHDRAWN')),
    reporting_user_id BIGINT NOT NULL REFERENCES account_holder(record_id),
    assigned_to_user_id BIGINT REFERENCES account_holder(record_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    first_response_timestamp TIMESTAMPTZ,
    resolved_timestamp TIMESTAMPTZ,
    concurrency_version BIGINT DEFAULT 1,
    CONSTRAINT valid_assignment CHECK (
        (current_state != 'CLOSURE') OR (assigned_to_user_id IS NOT NULL)
    )
);

CREATE INDEX idx_issue_state_severity ON issue(current_state, severity_level);
CREATE INDEX idx_issue_assigned_to ON issue(assigned_to_user_id);
CREATE INDEX idx_issue_created_at ON issue(created_at DESC);
CREATE INDEX idx_issue_reporter ON issue(reporting_user_id);

COMMENT ON TABLE issue IS 'Main issues/tickets in the support system';
COMMENT ON COLUMN issue.issue_key IS 'Human-readable ticket identifier (e.g., ISS-1001)';
COMMENT ON COLUMN issue.current_state IS 'Current lifecycle state of the issue';
COMMENT ON COLUMN issue.concurrency_version IS 'For optimistic locking';

-- Issue state transition audit
CREATE TABLE state_change_log (
    log_id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES issue(issue_id) ON DELETE CASCADE,
    transition_from_state VARCHAR(20) NOT NULL,
    transition_to_state VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT NOT NULL REFERENCES account_holder(record_id),
    change_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transition_reason TEXT
);

CREATE INDEX idx_state_change_log_issue ON state_change_log(issue_id);
CREATE INDEX idx_state_change_log_timestamp ON state_change_log(change_timestamp DESC);

COMMENT ON TABLE state_change_log IS 'Immutable log of all issue state transitions';

-- Issue message threads
CREATE TABLE issue_message (
    msg_id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES issue(issue_id) ON DELETE CASCADE,
    author_user_id BIGINT NOT NULL REFERENCES account_holder(record_id),
    message_text TEXT NOT NULL,
    parent_msg_id BIGINT REFERENCES issue_message(msg_id) ON DELETE CASCADE,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    concurrency_version BIGINT DEFAULT 1
);

CREATE INDEX idx_issue_message_issue ON issue_message(issue_id);
CREATE INDEX idx_issue_message_author ON issue_message(author_user_id);
CREATE INDEX idx_issue_message_parent ON issue_message(parent_msg_id);
CREATE INDEX idx_issue_message_posted_at ON issue_message(posted_at DESC);

COMMENT ON TABLE issue_message IS 'Comments/messages on issues with threading support';

-- File attachments
CREATE TABLE attached_file (
    file_id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT REFERENCES issue(issue_id) ON DELETE CASCADE,
    msg_id BIGINT REFERENCES issue_message(msg_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    stored_file_uri TEXT NOT NULL,
    file_byte_size BIGINT NOT NULL,
    mime_type_code VARCHAR(50),
    uploaded_by_user_id BIGINT NOT NULL REFERENCES account_holder(record_id),
    upload_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT file_belongs_to_issue_or_message CHECK (
        (issue_id IS NOT NULL AND msg_id IS NULL) OR (issue_id IS NULL AND msg_id IS NOT NULL)
    )
);

CREATE INDEX idx_attached_file_issue ON attached_file(issue_id);
CREATE INDEX idx_attached_file_message ON attached_file(msg_id);
CREATE INDEX idx_attached_file_uploaded_by ON attached_file(uploaded_by_user_id);

COMMENT ON TABLE attached_file IS 'File attachments for issues and messages';

-- Issue watchers
CREATE TABLE issue_follower (
    follower_relationship_id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES issue(issue_id) ON DELETE CASCADE,
    following_user_id BIGINT NOT NULL REFERENCES account_holder(record_id),
    followed_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_issue_follower UNIQUE(issue_id, following_user_id)
);

CREATE INDEX idx_issue_follower_issue ON issue_follower(issue_id);
CREATE INDEX idx_issue_follower_user ON issue_follower(following_user_id);

COMMENT ON TABLE issue_follower IS 'Users following/watching specific issues';
