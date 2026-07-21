# Project Progress

Last Updated: 2025

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Done |
| 🔄 | In Progress |
| ⏳ | Pending |
| ❌ | Blocked |

---

## Phase 1 — System Design

| Task | Status | Notes |
|---|---|---|
| Entity relationship design | ✅ | All 10 entities designed |
| Database schema proposal | ✅ | Full SQL schema defined |
| Backend package architecture | ✅ | Feature-based structure defined |
| API contract proposal | ✅ | All endpoints designed |
| Design documented in `initialPlan.md` | ✅ | |

---

## Phase 2 — Backend Foundation

### Infrastructure
| Task | Status | Notes |
|---|---|---|
| `build.gradle` dependencies | ✅ | JWT, Apache POI added |
| `application.properties` | ✅ | DB, JPA, Flyway, JWT, multipart config |
| Flyway migration `V1__init_schema.sql` | ✅ | All tables, indexes, seeded roles |

### Entities
| Entity | Status | Notes |
|---|---|---|
| `User` | ✅ | Implements `UserDetails` |
| `Role` | ✅ | |
| `RegressionPack` | ✅ | |
| `RegressionPackVersion` | ✅ | JSONB import summary |
| `RegressionTest` | ✅ | Identity anchor by `test_id_ref` |
| `RegressionTestVersion` | ✅ | Immutable, enums for priority/status |
| `RegressionSession` | ✅ | Status enum, timestamps |
| `RegressionExecutionResult` | ✅ | Pre-populated on session creation |
| `Attachment` | ✅ | |

### Repositories
| Repository | Status | Notes |
|---|---|---|
| `UserRepository` | ✅ | |
| `RoleRepository` | ✅ | |
| `RegressionPackRepository` | ✅ | |
| `RegressionPackVersionRepository` | ✅ | |
| `RegressionTestRepository` | ✅ | |
| `RegressionTestVersionRepository` | ✅ | |
| `RegressionSessionRepository` | ✅ | |
| `RegressionExecutionResultRepository` | ✅ | |
| `AttachmentRepository` | ✅ | |

### Common Layer
| Task | Status | Notes |
|---|---|---|
| `ApiResponse<T>` wrapper | ✅ | |
| `ResourceNotFoundException` | ✅ | |
| `ImportException` | ✅ | Carries list of validation errors |
| `GlobalExceptionHandler` | ✅ | Handles all exception types |

### Security
| Task | Status | Notes |
|---|---|---|
| `JwtService` | ✅ | Generate + validate tokens |
| `JwtAuthFilter` | ✅ | |
| `UserDetailsServiceImpl` | ✅ | Loads by email |
| `SecurityConfig` | ✅ | Stateless, CORS, method security |

### Auth
| Task | Status | Notes |
|---|---|---|
| `POST /api/auth/login` | ✅ | |
| `POST /api/auth/register` | ✅ | Assigns `QA_ENGINEER` role by default |
| `GET /api/auth/me` | ✅ | |

### Regression Packs
| Task | Status | Notes |
|---|---|---|
| `GET /api/regression-packs` | ✅ | |
| `POST /api/regression-packs` | ✅ | |
| `GET /api/regression-packs/{id}` | ✅ | |
| `PUT /api/regression-packs/{id}` | ✅ | |
| `DELETE /api/regression-packs/{id}` | ✅ | Soft delete |
| `GET /api/regression-packs/{id}/versions` | ✅ | |
| `GET /api/regression-packs/{id}/versions/{versionId}` | ✅ | |
| `POST /api/regression-packs/{id}/import` | ✅ | Excel import with diff detection |
| Excel parsing | ✅ | Apache POI, `.xlsx` |
| Excel validation | ✅ | Required fields, duplicate IDs |
| Change detection (added/modified/unchanged/removed) | ✅ | |
| Atomic import transaction | ✅ | Rolls back on any failure |

### Regression Tests
| Task | Status | Notes |
|---|---|---|
| `GET /api/regression-packs/{id}/versions/{versionId}/tests` | ✅ | |

### Regression Sessions
| Task | Status | Notes |
|---|---|---|
| `GET /api/regression-sessions` | ✅ | |
| `POST /api/regression-sessions` | ✅ | Pre-populates execution results |
| `GET /api/regression-sessions/{id}` | ✅ | Includes result tallies |
| `PUT /api/regression-sessions/{id}/status` | ✅ | Handles timestamps on transition |
| `GET /api/regression-sessions/{id}/results` | ✅ | |
| `PUT /api/regression-sessions/{id}/results/{resultId}` | ✅ | |
| `PUT /api/regression-sessions/{id}/results/bulk` | ✅ | |

### Attachments
| Task | Status | Notes |
|---|---|---|
| `POST /api/results/{resultId}/attachments` | ✅ | Stores file on disk |
| `GET /api/results/{resultId}/attachments` | ✅ | |
| `DELETE /api/attachments/{id}` | ✅ | Deletes file from disk + DB |

### Reports
| Task | Status | Notes |
|---|---|---|
| `GET /api/reports/sessions/{id}/summary` | ✅ | Pass rate + result breakdown |
| `GET /api/reports/packs/{id}/trends` | ✅ | Pass rate history across sessions |

---

## Phase 3 — Frontend

### Infrastructure
| Task | Status | Notes |
|---|---|---|
| Axios instance with JWT interceptor | ✅ | |
| React Query setup | ✅ | |
| Auth context + provider | ✅ | |

### Auth Feature
| Task | Status | Notes |
|---|---|---|
| Login page | ✅ | |
| Register page | ✅ | |
| Protected route wrapper | ✅ | App layout redirects unauthenticated users |

### Regression Packs Feature
| Task | Status | Notes |
|---|---|---|
| Pack list page | ✅ | |
| Pack detail page | ✅ | |
| Version list | ✅ | Inline on detail page |
| Excel import modal | ✅ | |
| Import result summary display | ✅ | Shown after successful import |

### Regression Sessions Feature
| Task | Status | Notes |
|---|---|---|
| Session list page | ✅ | |
| Create session form | ✅ | Pack + version selector |
| Session detail page | ✅ | Status transitions + tallies |
| Execution results table | ✅ | Inline result + comment editing |
| Bulk result update | ✅ | Hook wired, available for future use |

### Reports Feature
| Task | Status | Notes |
|---|---|---|
| Session summary view | ✅ | Donut chart with pass rate + breakdown |
| Pack trend chart | ✅ | Line chart of pass rate across sessions |

### Dashboard
| Task | Status | Notes |
|---|---|---|
| Active sessions widget | ✅ | |
| Recent packs widget | ✅ | |
| Stats overview | ✅ | Total packs, active sessions, completed sessions, overall pass rate |

---

## Phase 4 — Testing

| Task | Status | Notes |
|---|---|---|
| Backend integration tests | ✅ | Testcontainers PostgreSQL, MockMvc |
| Excel import edge case tests | ✅ | Missing fields, duplicate IDs, modified, removed |
| API contract tests | ✅ | Auth, packs, sessions covered |

---

## Phase 5 — Future Integrations

| Integration | Status | Notes |
|---|---|---|
| Excel export | ⏳ | Export pack version back to `.xlsx` |
| Jira integration | ⏳ | |
| GitHub integration | ⏳ | |
| Azure DevOps integration | ⏳ | |
| Email notifications | ⏳ | |
| Role-based permissions (fine-grained) | ⏳ | Currently role seeded, not enforced per endpoint |
| Audit log population | ⏳ | Table exists, service not yet wired |

---

## Known Gaps / Technical Debt

| Item | Priority | Notes |
|---|---|---|
| Audit log service not wired | Medium | `audit_logs` table exists but `AuditService` not implemented |
| Excel export not implemented | Medium | Import works, export is pending |
| Attachment storage uses local disk | Low | Should move to S3 or object storage for production |
| Role-based endpoint authorization | Medium | `@PreAuthorize` not yet applied per endpoint |
| Refresh token endpoint | Low | `/api/auth/refresh` designed but not implemented |
| Pack version diff endpoint | Low | `/api/regression-packs/{id}/versions/{versionId}/diff` designed but not implemented |
| Test execution history endpoint | Low | `/api/reports/tests/{id}/history` designed but not implemented |
