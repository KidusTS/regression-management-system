# Database Schema

## Overview

PostgreSQL database managed entirely by Flyway migrations.
Hibernate is set to `ddl-auto=validate` — it never modifies the schema.

## Tables

### users
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| is_active | BOOLEAN | NOT NULL, DEFAULT true |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

### roles
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(50) | NOT NULL, UNIQUE |
| description | VARCHAR(255) | |
| created_at | TIMESTAMP | NOT NULL |

Seeded values: `ADMIN`, `QA_LEAD`, `QA_ENGINEER`, `VIEWER`

### user_roles
| Column | Type | Constraints |
|---|---|---|
| user_id | UUID | FK → users.id, CASCADE DELETE |
| role_id | UUID | FK → roles.id, CASCADE DELETE |

PK: `(user_id, role_id)`

### regression_packs
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| project | VARCHAR(255) | |
| is_active | BOOLEAN | NOT NULL, DEFAULT true |
| created_by | UUID | FK → users.id, SET NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### regression_pack_versions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| regression_pack_id | UUID | NOT NULL, FK → regression_packs.id, CASCADE DELETE |
| version_number | INTEGER | NOT NULL |
| label | VARCHAR(100) | |
| source_file_name | VARCHAR(255) | |
| import_summary | JSONB | `{added, modified, unchanged, removed}` |
| is_active | BOOLEAN | NOT NULL, DEFAULT true |
| created_by | UUID | FK → users.id, SET NULL |
| created_at | TIMESTAMP | NOT NULL |

UNIQUE: `(regression_pack_id, version_number)`

### regression_tests
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| regression_pack_id | UUID | NOT NULL, FK → regression_packs.id, CASCADE DELETE |
| test_id_ref | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

UNIQUE: `(regression_pack_id, test_id_ref)`

### regression_test_versions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| regression_test_id | UUID | NOT NULL, FK → regression_tests.id, CASCADE DELETE |
| version_number | INTEGER | NOT NULL |
| module | VARCHAR(255) | |
| feature | VARCHAR(255) | |
| title | VARCHAR(500) | NOT NULL |
| preconditions | TEXT | |
| test_steps | TEXT | NOT NULL |
| expected_result | TEXT | NOT NULL |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'MEDIUM' |
| automation_status | VARCHAR(50) | NOT NULL, DEFAULT 'MANUAL' |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'ACTIVE' |
| change_type | VARCHAR(20) | NOT NULL, DEFAULT 'ADDED' |
| created_at | TIMESTAMP | NOT NULL |

UNIQUE: `(regression_test_id, version_number)`

### pack_version_tests
| Column | Type | Constraints |
|---|---|---|
| pack_version_id | UUID | FK → regression_pack_versions.id, CASCADE DELETE |
| test_version_id | UUID | FK → regression_test_versions.id, CASCADE DELETE |
| display_order | INTEGER | NOT NULL, DEFAULT 0 |

PK: `(pack_version_id, test_version_id)`

### regression_sessions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| pack_version_id | UUID | NOT NULL, FK → regression_pack_versions.id |
| software_version | VARCHAR(100) | |
| environment | VARCHAR(100) | |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'PLANNED' |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| created_by | UUID | FK → users.id, SET NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### regression_execution_results
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | NOT NULL, FK → regression_sessions.id, CASCADE DELETE |
| test_version_id | UUID | NOT NULL, FK → regression_test_versions.id |
| result | VARCHAR(20) | NOT NULL, DEFAULT 'NOT_RUN' |
| comment | TEXT | |
| executed_by | UUID | FK → users.id, SET NULL |
| executed_at | TIMESTAMP | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

UNIQUE: `(session_id, test_version_id)`

### attachments
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| execution_result_id | UUID | NOT NULL, FK → regression_execution_results.id, CASCADE DELETE |
| file_name | VARCHAR(255) | NOT NULL |
| file_path | VARCHAR(500) | NOT NULL |
| file_size | BIGINT | |
| mime_type | VARCHAR(100) | |
| uploaded_by | UUID | FK → users.id, SET NULL |
| uploaded_at | TIMESTAMP | NOT NULL |

### audit_logs
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | UUID | NOT NULL |
| action | VARCHAR(50) | NOT NULL |
| performed_by | UUID | FK → users.id, SET NULL |
| performed_at | TIMESTAMP | NOT NULL |
| details | JSONB | |

## Indexes

| Index | Table | Column(s) |
|---|---|---|
| idx_users_email | users | email |
| idx_pack_versions_pack_id | regression_pack_versions | regression_pack_id |
| idx_tests_pack_id | regression_tests | regression_pack_id |
| idx_test_versions_test_id | regression_test_versions | regression_test_id |
| idx_sessions_pack_version_id | regression_sessions | pack_version_id |
| idx_results_session_id | regression_execution_results | session_id |
| idx_results_test_version_id | regression_execution_results | test_version_id |
| idx_attachments_result_id | attachments | execution_result_id |
| idx_audit_entity | audit_logs | entity_type, entity_id |
