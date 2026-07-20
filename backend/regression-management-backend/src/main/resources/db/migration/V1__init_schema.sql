-- =====================================================
-- V1__init_schema.sql
-- Initial schema for Regression Management System
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Users & Roles
-- =====================================================

CREATE TABLE roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP   NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT true,
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =====================================================
-- Regression Packs
-- =====================================================

CREATE TABLE regression_packs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    project     VARCHAR(255),
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE regression_pack_versions (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    regression_pack_id  UUID         NOT NULL REFERENCES regression_packs(id) ON DELETE CASCADE,
    version_number      INTEGER      NOT NULL,
    label               VARCHAR(100),
    source_file_name    VARCHAR(255),
    import_summary      JSONB,
    is_active           BOOLEAN      NOT NULL DEFAULT true,
    created_by          UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP    NOT NULL DEFAULT now(),
    UNIQUE (regression_pack_id, version_number)
);

-- =====================================================
-- Regression Tests
-- =====================================================

CREATE TABLE regression_tests (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    regression_pack_id UUID         NOT NULL REFERENCES regression_packs(id) ON DELETE CASCADE,
    test_id_ref        VARCHAR(100) NOT NULL,
    created_at         TIMESTAMP    NOT NULL DEFAULT now(),
    UNIQUE (regression_pack_id, test_id_ref)
);

CREATE TABLE regression_test_versions (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    regression_test_id   UUID         NOT NULL REFERENCES regression_tests(id) ON DELETE CASCADE,
    version_number       INTEGER      NOT NULL,
    module               VARCHAR(255),
    feature              VARCHAR(255),
    title                VARCHAR(500) NOT NULL,
    preconditions        TEXT,
    test_steps           TEXT         NOT NULL,
    expected_result      TEXT         NOT NULL,
    priority             VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    automation_status    VARCHAR(50)  NOT NULL DEFAULT 'MANUAL',
    status               VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    change_type          VARCHAR(20)  NOT NULL DEFAULT 'ADDED',
    created_at           TIMESTAMP    NOT NULL DEFAULT now(),
    UNIQUE (regression_test_id, version_number)
);

-- =====================================================
-- Pack Version → Test Version (join)
-- =====================================================

CREATE TABLE pack_version_tests (
    pack_version_id UUID    NOT NULL REFERENCES regression_pack_versions(id) ON DELETE CASCADE,
    test_version_id UUID    NOT NULL REFERENCES regression_test_versions(id) ON DELETE CASCADE,
    display_order   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (pack_version_id, test_version_id)
);

-- =====================================================
-- Regression Sessions
-- =====================================================

CREATE TABLE regression_sessions (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    pack_version_id  UUID         NOT NULL REFERENCES regression_pack_versions(id),
    software_version VARCHAR(100),
    environment      VARCHAR(100),
    status           VARCHAR(50)  NOT NULL DEFAULT 'PLANNED',
    started_at       TIMESTAMP,
    completed_at     TIMESTAMP,
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT now()
);

-- =====================================================
-- Execution Results
-- =====================================================

CREATE TABLE regression_execution_results (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID        NOT NULL REFERENCES regression_sessions(id) ON DELETE CASCADE,
    test_version_id UUID        NOT NULL REFERENCES regression_test_versions(id),
    result          VARCHAR(20) NOT NULL DEFAULT 'NOT_RUN',
    comment         TEXT,
    executed_by     UUID        REFERENCES users(id) ON DELETE SET NULL,
    executed_at     TIMESTAMP,
    created_at      TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT now(),
    UNIQUE (session_id, test_version_id)
);

-- =====================================================
-- Attachments
-- =====================================================

CREATE TABLE attachments (
    id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_result_id   UUID         NOT NULL REFERENCES regression_execution_results(id) ON DELETE CASCADE,
    file_name             VARCHAR(255) NOT NULL,
    file_path             VARCHAR(500) NOT NULL,
    file_size             BIGINT,
    mime_type             VARCHAR(100),
    uploaded_by           UUID         REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at           TIMESTAMP    NOT NULL DEFAULT now()
);

-- =====================================================
-- Audit Log
-- =====================================================

CREATE TABLE audit_logs (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type  VARCHAR(100) NOT NULL,
    entity_id    UUID         NOT NULL,
    action       VARCHAR(50)  NOT NULL,
    performed_by UUID         REFERENCES users(id) ON DELETE SET NULL,
    performed_at TIMESTAMP    NOT NULL DEFAULT now(),
    details      JSONB
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_users_email                ON users(email);
CREATE INDEX idx_pack_versions_pack_id      ON regression_pack_versions(regression_pack_id);
CREATE INDEX idx_tests_pack_id              ON regression_tests(regression_pack_id);
CREATE INDEX idx_test_versions_test_id      ON regression_test_versions(regression_test_id);
CREATE INDEX idx_sessions_pack_version_id   ON regression_sessions(pack_version_id);
CREATE INDEX idx_results_session_id         ON regression_execution_results(session_id);
CREATE INDEX idx_results_test_version_id    ON regression_execution_results(test_version_id);
CREATE INDEX idx_attachments_result_id      ON attachments(execution_result_id);
CREATE INDEX idx_audit_entity               ON audit_logs(entity_type, entity_id);

-- =====================================================
-- Seed default roles
-- =====================================================

INSERT INTO roles (name, description) VALUES
    ('ADMIN',       'Full system access'),
    ('QA_LEAD',     'Manage packs, sessions, and team'),
    ('QA_ENGINEER', 'Execute regression sessions'),
    ('VIEWER',      'Read-only access');
