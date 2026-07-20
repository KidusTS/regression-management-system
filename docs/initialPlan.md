# Initial System Design Plan

**Date:** 2025  
**Phase:** Pre-Implementation — Design Only  
**Status:** Awaiting Review

---

## Purpose

This document captures the full system design produced before any implementation code was written.
It serves as the architectural baseline for the Regression Management System.

---

## 1. Entity Relationship Design

### Relationships Overview

```
User ──< RegressionSession (created_by)
User ──< RegressionPack (created_by)
User ──< AuditLog (performed_by)

Role >──< User (many-to-many via user_roles)

RegressionPack ──< RegressionPackVersion
RegressionPackVersion >──< RegressionTestVersion (many-to-many via pack_version_tests)

RegressionTest ──< RegressionTestVersion
RegressionTestVersion ──< RegressionExecutionResult

RegressionSession ──> RegressionPackVersion
RegressionSession ──< RegressionExecutionResult

RegressionExecutionResult ──< Attachment
AuditLog ──> User
```

---

### Entity Field Definitions

#### User
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### Role
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE NOT NULL |
| description | VARCHAR(255) | |
| created_at | TIMESTAMP | NOT NULL |

Roles: `ADMIN`, `QA_LEAD`, `QA_ENGINEER`, `VIEWER`

#### user_roles (join table)
| Field | Type | Constraints |
|---|---|---|
| user_id | UUID | FK → users.id |
| role_id | UUID | FK → roles.id |

PK: `(user_id, role_id)`

#### RegressionPack
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| project | VARCHAR(255) | |
| is_active | BOOLEAN | DEFAULT true |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### RegressionPackVersion
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| regression_pack_id | UUID | FK → regression_packs.id NOT NULL |
| version_number | INTEGER | NOT NULL |
| label | VARCHAR(100) | e.g. "v1", "v2-sprint-42" |
| source_file_name | VARCHAR(255) | original Excel filename |
| import_summary | JSONB | `{added, modified, removed}` |
| is_active | BOOLEAN | DEFAULT true |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | NOT NULL |

UNIQUE: `(regression_pack_id, version_number)`

#### RegressionTest
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| regression_pack_id | UUID | FK → regression_packs.id NOT NULL |
| test_id_ref | VARCHAR(100) | NOT NULL — Test ID from Excel (e.g. TC-001) |
| created_at | TIMESTAMP | NOT NULL |

UNIQUE: `(regression_pack_id, test_id_ref)`

#### RegressionTestVersion
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| regression_test_id | UUID | FK → regression_tests.id NOT NULL |
| version_number | INTEGER | NOT NULL |
| module | VARCHAR(255) | |
| feature | VARCHAR(255) | |
| title | VARCHAR(500) | NOT NULL |
| preconditions | TEXT | |
| test_steps | TEXT | NOT NULL |
| expected_result | TEXT | NOT NULL |
| priority | VARCHAR(20) | HIGH, MEDIUM, LOW |
| automation_status | VARCHAR(50) | MANUAL, AUTOMATED, IN_PROGRESS |
| status | VARCHAR(50) | ACTIVE, DEPRECATED |
| change_type | VARCHAR(20) | ADDED, MODIFIED, UNCHANGED |
| created_at | TIMESTAMP | NOT NULL |

UNIQUE: `(regression_test_id, version_number)`

#### pack_version_tests (join table)
| Field | Type | Constraints |
|---|---|---|
| pack_version_id | UUID | FK → regression_pack_versions.id |
| test_version_id | UUID | FK → regression_test_versions.id |
| display_order | INTEGER | |

PK: `(pack_version_id, test_version_id)`

#### RegressionSession
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| pack_version_id | UUID | FK → regression_pack_versions.id NOT NULL |
| software_version | VARCHAR(100) | e.g. "v2.4.1" |
| environment | VARCHAR(100) | e.g. "UAT", "Staging" |
| status | VARCHAR(50) | PLANNED, IN_PROGRESS, COMPLETED, ABORTED |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

#### RegressionExecutionResult
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | FK → regression_sessions.id NOT NULL |
| test_version_id | UUID | FK → regression_test_versions.id NOT NULL |
| result | VARCHAR(20) | PASS, FAIL, BLOCKED, SKIPPED, NOT_RUN |
| comment | TEXT | |
| executed_by | UUID | FK → users.id |
| executed_at | TIMESTAMP | |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

UNIQUE: `(session_id, test_version_id)`

#### Attachment
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| execution_result_id | UUID | FK → regression_execution_results.id NOT NULL |
| file_name | VARCHAR(255) | NOT NULL |
| file_path | VARCHAR(500) | NOT NULL |
| file_size | BIGINT | |
| mime_type | VARCHAR(100) | |
| uploaded_by | UUID | FK → users.id |
| uploaded_at | TIMESTAMP | NOT NULL |

#### AuditLog
| Field | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| entity_type | VARCHAR(100) | NOT NULL — e.g. "RegressionSession" |
| entity_id | UUID | NOT NULL |
| action | VARCHAR(50) | NOT NULL — CREATED, UPDATED, DELETED, IMPORTED |
| performed_by | UUID | FK → users.id |
| performed_at | TIMESTAMP | NOT NULL |
| details | JSONB | snapshot of what changed |

---

### Key Design Decisions

- `RegressionTest` is the identity anchor — it tracks a test across versions by its `test_id_ref` from Excel.
- `RegressionTestVersion` is immutable once created. Any change to a test creates a new version.
- `pack_version_tests` links a `RegressionPackVersion` to exact `RegressionTestVersion` rows — this is what makes sessions immutable. A session references a pack version, which references frozen test versions.
- `import_summary` on `RegressionPackVersion` stores the diff metadata as JSONB for flexibility.
- `change_type` on `RegressionTestVersion` records whether this version was ADDED, MODIFIED, or UNCHANGED relative to the previous pack version.

---

## 2. Excel Import Design

### Parsing Flow

```
Excel Upload
     │
     ▼
Parse & Validate Rows
     │
     ├── Missing required fields?  ──► Return validation errors (do not import)
     │
     ▼
Load current active RegressionPackVersion
     │
     ▼
Diff against current version
     │
     ├── New test_id_ref?                        ──► Mark as ADDED
     ├── test_id_ref exists, fields changed?     ──► Mark as MODIFIED
     ├── test_id_ref exists, no changes?         ──► Mark as UNCHANGED
     └── test_id_ref in current, not in Excel?   ──► Mark as REMOVED
     │
     ▼
Create new RegressionPackVersion (version_number + 1)
     │
     ▼
For ADDED/MODIFIED tests:   Create new RegressionTestVersion
For UNCHANGED tests:        Reuse existing RegressionTestVersion
     │
     ▼
Populate pack_version_tests for new version
     │
     ▼
Store import_summary on new RegressionPackVersion
     │
     ▼
Return import result to client
```

### Expected Excel Columns

| Column | Required |
|---|---|
| Module | No |
| Feature | No |
| Test ID | Yes |
| Test Title | Yes |
| Preconditions | No |
| Test Steps | Yes |
| Expected Result | Yes |
| Priority | No (defaults to MEDIUM) |
| Automation Status | No |
| Status | No |

### Validation Rules

| Rule | Behavior |
|---|---|
| Test ID missing | Reject row, return error |
| Title missing | Reject row, return error |
| Test Steps missing | Reject row, return error |
| Expected Result missing | Reject row, return error |
| Priority not HIGH/MEDIUM/LOW | Default to MEDIUM |
| Duplicate Test ID within same Excel | Reject entire import |
| Empty sheet | Reject import |

### Change Detection Logic

Two test versions are considered equal if all of these fields match:
`module`, `feature`, `title`, `preconditions`, `test_steps`, `expected_result`, `priority`, `automation_status`, `status`

---

## 3. Backend Package Architecture

```
com.regression/
│
├── config/
│   ├── SecurityConfig
│   ├── JpaConfig
│   └── WebConfig
│
├── security/
│   ├── JwtService
│   ├── JwtAuthFilter
│   └── UserDetailsServiceImpl
│
├── common/
│   ├── exception/
│   │   ├── GlobalExceptionHandler
│   │   ├── ResourceNotFoundException
│   │   ├── ValidationException
│   │   └── ImportException
│   ├── response/
│   │   └── ApiResponse<T>
│   └── audit/
│       └── AuditService
│
├── auth/
│   ├── controller/AuthController
│   ├── dto/LoginRequest, LoginResponse, RegisterRequest
│   └── service/AuthService
│
├── user/
│   ├── controller/UserController
│   ├── dto/UserDto, UserSummaryDto
│   ├── entity/User, Role
│   ├── repository/UserRepository, RoleRepository
│   ├── service/UserService
│   └── mapper/UserMapper
│
├── regressionpack/
│   ├── controller/RegressionPackController
│   ├── dto/RegressionPackDto, RegressionPackVersionDto, ImportResultDto
│   ├── entity/RegressionPack, RegressionPackVersion
│   ├── repository/RegressionPackRepository, RegressionPackVersionRepository
│   ├── service/RegressionPackService, ExcelImportService
│   └── mapper/RegressionPackMapper
│
├── regressiontest/
│   ├── controller/RegressionTestController
│   ├── dto/RegressionTestDto, RegressionTestVersionDto
│   ├── entity/RegressionTest, RegressionTestVersion
│   ├── repository/RegressionTestRepository, RegressionTestVersionRepository
│   ├── service/RegressionTestService
│   └── mapper/RegressionTestMapper
│
├── regressionsession/
│   ├── controller/RegressionSessionController
│   ├── dto/RegressionSessionDto, CreateSessionRequest, ExecutionResultDto
│   ├── entity/RegressionSession, RegressionExecutionResult
│   ├── repository/RegressionSessionRepository, RegressionExecutionResultRepository
│   ├── service/RegressionSessionService
│   └── mapper/RegressionSessionMapper
│
├── attachment/
│   ├── controller/AttachmentController
│   ├── dto/AttachmentDto
│   ├── entity/Attachment
│   ├── repository/AttachmentRepository
│   └── service/AttachmentService
│
└── report/
    ├── controller/ReportController
    ├── dto/SessionSummaryDto, TrendReportDto
    └── service/ReportService
```

---

## 4. API Contract

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT | No |
| POST | `/api/auth/register` | Register new user | No / Admin only |
| POST | `/api/auth/refresh` | Refresh JWT | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Regression Packs

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/regression-packs` | List all packs | Yes |
| POST | `/api/regression-packs` | Create a new pack | Yes |
| GET | `/api/regression-packs/{id}` | Get pack details | Yes |
| PUT | `/api/regression-packs/{id}` | Update pack metadata | Yes |
| DELETE | `/api/regression-packs/{id}` | Soft delete pack | Yes |
| GET | `/api/regression-packs/{id}/versions` | List all versions | Yes |
| GET | `/api/regression-packs/{id}/versions/{versionId}` | Get specific version | Yes |
| POST | `/api/regression-packs/{id}/import` | Import Excel → new version | Yes |
| GET | `/api/regression-packs/{id}/versions/{versionId}/export` | Export version to Excel | Yes |
| GET | `/api/regression-packs/{id}/versions/{versionId}/diff` | Diff two versions | Yes |

### Regression Tests

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/regression-packs/{id}/versions/{versionId}/tests` | List tests in a version | Yes |
| GET | `/api/regression-tests/{id}` | Get test identity + all versions | Yes |
| GET | `/api/regression-tests/{id}/versions` | List all versions of a test | Yes |

### Regression Sessions

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/regression-sessions` | List all sessions | Yes |
| POST | `/api/regression-sessions` | Create a new session | Yes |
| GET | `/api/regression-sessions/{id}` | Get session details | Yes |
| PUT | `/api/regression-sessions/{id}` | Update session metadata | Yes |
| PUT | `/api/regression-sessions/{id}/status` | Update session status | Yes |
| GET | `/api/regression-sessions/{id}/results` | Get all execution results | Yes |
| PUT | `/api/regression-sessions/{id}/results/{resultId}` | Update a single result | Yes |
| PUT | `/api/regression-sessions/{id}/results/bulk` | Bulk update results | Yes |

### Attachments

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/results/{resultId}/attachments` | Upload attachment | Yes |
| GET | `/api/results/{resultId}/attachments` | List attachments | Yes |
| DELETE | `/api/attachments/{id}` | Delete attachment | Yes |

### Reports

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/reports/sessions/{id}/summary` | Pass/fail summary for a session | Yes |
| GET | `/api/reports/packs/{id}/trends` | Pass rate trends over sessions | Yes |
| GET | `/api/reports/tests/{id}/history` | Execution history for a test | Yes |

---

## 5. Documentation To Be Created After Approval

Once this design is reviewed and approved, the following documentation files will be created:

| File | Content |
|---|---|
| `docs/database/database-schema.md` | Full SQL schema |
| `docs/database/entity-relationships.md` | ERD descriptions and relationship rules |
| `docs/database/migrations.md` | Flyway migration log |
| `docs/architecture/system-architecture.md` | Client-server overview |
| `docs/architecture/backend-architecture.md` | Package structure and layer responsibilities |
| `docs/architecture/frontend-architecture.md` | Feature-based frontend structure |
| `docs/api/api-overview.md` | Auth, conventions, error formats |
| `docs/api/` | Per-resource endpoint documentation |
| `docs/requirements/functional-requirements.md` | Feature requirements |
| `docs/requirements/non-functional-requirements.md` | Performance, security, scalability |
| `docs/decisions/architecture-decisions.md` | Why key decisions were made |
| `docs/changelog.md` | Dated change log |

---

## 6. Core Business Rules (Non-Negotiable)

1. Regression Pack Versions are immutable once created.
2. Regression Test Versions are immutable once created.
3. Regression Sessions reference exact pack versions — never the latest.
4. Historical execution results cannot be changed.
5. Excel remains the primary editing format. The app must never lock users into editing tests only inside the UI.
6. If a regression library changes in the future, all previous sessions must remain unchanged and fully readable.

---

## 7. Future Integrations Considered in Design

The architecture should not block future integration with:

- Jira
- GitHub
- Azure DevOps
- Jenkins
- Playwright
- Selenium
- Cypress

These are not in scope for the current phase but the data model and API design should not make them difficult to add.
