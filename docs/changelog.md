## [0.8.0] — 2026-07-21 — Excel Export, UX Improvements & Lazy Loading Fixes

### Summary
Excel export implemented. Frontend UX improved across packs and sessions. Comprehensive lazy loading fixes applied across all backend services and repositories.

### Added

**Backend — Excel Export**
- `ExcelExportService` — builds `.xlsx` workbook from a pack version's test data using Apache POI with bold headers and auto-sized columns
- `GET /api/regression-packs/{id}/versions/{versionId}/export` — streams file with correct `Content-Disposition` and MIME type headers

**Frontend — Excel Export**
- `packService.exportVersion()` — fetches blob and triggers browser download
- `useExportVersion` mutation hook
- Export button added to each version row on pack detail page, named `{packName}-v{n}.xlsx`

**Frontend — Create Pack with Import**
- `useCreatePackWithImport` hook — chains pack creation and Excel import in a single mutation
- `CreatePackModal` updated with optional `.xlsx` file picker — if file attached, creates pack and imports in one action, shows import result summary inline

### Fixed

**Backend — Lazy Loading (LazyInitializationException)**
- Added `@Transactional(readOnly=true)` to all read methods across `RegressionPackService`, `RegressionTestService`, `RegressionSessionService`, `ReportService`, `AttachmentService`
- Added JPQL `JOIN FETCH` queries to `RegressionPackVersionRepository` — eagerly loads `regressionPack`, `testVersions`, `regressionTest`
- Added JPQL `JOIN FETCH` queries to `RegressionSessionRepository` — eagerly loads `packVersion`, `regressionPack`, `results`
- Added `JOIN FETCH` query to `RegressionExecutionResultRepository` — eagerly loads `testVersion` and `regressionTest`
- Fixed `MultipleBagFetchException` in session repository by removing `testVersions` collection fetch and replacing `getTestVersions().size()` with a dedicated `COUNT` query (`countTestsByVersionId`)
- All services updated to use `findByIdWithDetails` fetch-join variants instead of plain `findById`

**Backend — Excel Import**
- Replaced fixed column index parsing with header-name-based parsing — column order in Excel no longer matters
- Recognized headers: Module, Feature, Test ID, Test Title/Title, Preconditions, Test Steps, Expected Result, Priority, Automation Status, Status (all case-insensitive)
- Fixed `Map.of()` exceeding 10-entry limit — replaced with `Map.ofEntries()`

**Backend — Attachment & Session Services**
- Fixed `AttachmentController` and `AttachmentService` manual instantiation (`= new`, `= null`) — now properly Spring-injected

**Frontend — Dark Mode & Typography**
- Enabled dark mode globally via `dark` class on `<html>`
- Switched font from Geist to Inter (sans) and JetBrains Mono (mono)
- Base font size set to 16px

**Frontend — UX**
- Pack name in packs table styled as primary-color link with explicit View button
- Import modal renamed to "Import New Version" with next version number shown and explanation of what importing does
- Native `<select>` elements in `CreateSessionModal` fixed for dark mode with `[color-scheme:dark]`
- Import validation errors from 422 responses now displayed inline in the import modal

### Affected Modules
- `backend/regression-management-backend/src/main/java/com/regression/regressionpack/`
- `backend/regression-management-backend/src/main/java/com/regression/regressiontest/`
- `backend/regression-management-backend/src/main/java/com/regression/regressionsession/`
- `backend/regression-management-backend/src/main/java/com/regression/report/`
- `backend/regression-management-backend/src/main/java/com/regression/attachment/`
- `frontend/src/features/regression-packs/`
- `frontend/src/features/regression-sessions/`
- `frontend/src/app/`

---

## [0.7.0] — 2025 — Backend Integration Tests

### Summary
Phase 4 — Testing complete. Full integration test suite added using Testcontainers.

### Added

**Testing Infrastructure**
- `BaseIntegrationTest` — shared Testcontainers PostgreSQL container, Flyway runs on startup, `@SpringBootTest` + `@AutoConfigureMockMvc`
- `AuthTestHelper` — registers a user and returns a Bearer token for use across test classes
- `ExcelTestHelper` — builds valid in-memory `.xlsx` files matching the `ExcelImportService` column layout

**Auth Tests** (`AuthControllerTest`) — 6 tests
- Register with valid request returns token and user details
- Duplicate email returns 400
- Login with valid credentials returns token
- Login with wrong password returns 401
- GET /me with valid token returns current user
- GET /me without token returns 401

**Regression Pack Tests** (`RegressionPackControllerTest`) — 11 tests
- Create pack (valid, missing name, unauthenticated)
- Get all, get by ID, get non-existent (404)
- Update pack
- Soft delete (removed from list)
- Excel import: first import counts, identical re-import all unchanged, modified test detected, removed test counted, missing required field rejected, duplicate test ID rejected
- Get versions after import

**Regression Session Tests** (`RegressionSessionControllerTest`) — 11 tests
- Create session (valid, invalid pack version, missing name)
- Get all, get by ID, get non-existent (404)
- Status transitions: PLANNED → IN_PROGRESS sets startedAt, IN_PROGRESS → COMPLETED sets completedAt, invalid status returns 400
- Get results returns pre-populated NOT_RUN rows
- Update single result updates tally on session
- Bulk update all 3 results, tally reflects all changes

**Dependencies added**
- `org.testcontainers:junit-jupiter`
- `org.testcontainers:postgresql`

### Affected Modules
- `backend/regression-management-backend/src/test/`
- `backend/regression-management-backend/build.gradle`

---

 — 2025 — Frontend Dashboard

### Summary
Dashboard implemented. Phase 3 — Frontend is now complete.

### Added

**Frontend — Dashboard**
- 4 stat cards: Total Packs, Active Sessions, Completed Sessions, Overall Pass Rate (derived from completed sessions)
- Active sessions table (IN_PROGRESS only) with pass/fail/total counts and links to detail
- Recent packs table (last 5 by updatedAt) with links to detail
- All data derived from existing `useSessions` and `usePacks` hooks — no new endpoints needed
- All stat cards are clickable links to their respective pages

### Affected Modules
- `frontend/src/app/(app)/dashboard/`

---

 — 2025 — Frontend Reports Feature

### Summary
Reports feature fully implemented on the frontend.

### Added

**Frontend — Reports**
- Types matching `SessionSummaryDto` and `TrendReportDto`
- `reportService` covering both report endpoints
- `useSessionSummary` and `usePackTrends` query hooks
- `SessionSummaryCard` — donut chart (Recharts) with pass rate in centre + result breakdown legend
- `PackTrendChart` — line chart of pass rate across sessions for a pack
- Reports page (`/reports`) — session selector drives summary card, pack selector drives trend chart

**Dependencies added**
- `recharts` — charting library

### Affected Modules
- `frontend/src/features/reports/`
- `frontend/src/app/(app)/reports/`

---

 — 2025 — Frontend Regression Sessions Feature

### Summary
Regression Sessions feature fully implemented on the frontend.

### Added

**Frontend — Regression Sessions**
- Types matching all session backend DTOs
- `sessionService` covering all session endpoints
- Query hooks: `useSessions`, `useSessionDetail`, `useSessionResults`
- Mutation hooks: `useCreateSession`, `useUpdateSessionStatus`, `useUpdateResult`, `useBulkUpdateResults`
- `SessionStatusBadge` — colour-coded per status
- `SessionsTable` — list with pass/fail tallies and links to detail
- `CreateSessionModal` — pack selector drives version selector dynamically
- `ExecutionResultsTable` — inline result dropdown + comment field, saves on change/blur
- Session list page (`/regression-sessions`)
- Session detail page (`/regression-sessions/[id]`) — status transitions, tally cards, results table

### Affected Modules
- `frontend/src/features/regression-sessions/`
- `frontend/src/app/(app)/regression-sessions/`

---

 — 2025 — Frontend Regression Packs Feature

### Summary
Regression Packs feature fully implemented on the frontend.

### Added

**Frontend — Regression Packs**
- Types matching all backend DTOs (`RegressionPack`, `RegressionPackVersion`, `RegressionTestVersion`, `ImportResult`)
- `packService` covering all pack endpoints including Excel import
- Query hooks: `usePacks`, `usePackDetail`, `usePackVersions`, `usePackVersionTests`
- Mutation hooks: `useCreatePack`, `useUpdatePack`, `useDeletePack`, `useImportPack`
- `PacksTable` — list with edit and delete actions
- `CreatePackModal` — handles both create and edit
- `ImportPackModal` — file picker with result summary shown after import
- `ImportResultSummary` — displays added/modified/unchanged/removed/total counts
- Pack list page (`/regression-packs`)
- Pack detail page (`/regression-packs/[id]`) — versions table with inline test viewer

### Affected Modules
- `frontend/src/features/regression-packs/`
- `frontend/src/app/(app)/regression-packs/`

---

 — 2025 — Frontend Infrastructure & Auth

### Summary
Frontend phase started. Core infrastructure and auth feature fully implemented.

### Added

**Frontend — Infrastructure**
- Axios instance (`src/services/api.ts`) with JWT request interceptor and 401 redirect
- React Query client provider (`src/providers/QueryProvider.tsx`)
- Auth context and provider (`src/providers/AuthProvider.tsx`) — manages current user and token in localStorage
- Root layout wrapping the app with `QueryProvider` and `AuthProvider`
- Root page redirecting to `/dashboard`

**Frontend — Layout**
- Top nav (`src/components/layout/TopNav.tsx`) with nav links and sign out
- Protected app layout (`src/app/(app)/layout.tsx`) — redirects unauthenticated users to `/login`
- Auth route group layout (`src/app/(auth)/layout.tsx`) — centered card, no nav

**Frontend — Auth Feature**
- Login page (`/login`) with email/password form
- Register page (`/register`) with first name, last name, email, password form
- Zod validation schemas for both forms
- `useLogin` and `useRegister` mutation hooks
- `authService` calling `POST /api/auth/login` and `POST /api/auth/register`

**Frontend — Dashboard**
- Dashboard placeholder page (`/dashboard`)

### Affected Modules
- `frontend/src/`

---

## [0.1.0] — 2025 — Initial Backend Foundation

### Summary
First development phase complete. Full backend foundation implemented from scratch based on the initial system design plan.

### Added

**Database**
- `V1__init_schema.sql` — full schema with all 10 tables, indexes, and seeded roles

**Backend — Security**
- JWT-based stateless authentication (`JwtService`, `JwtAuthFilter`)
- `UserDetailsServiceImpl` loading users by email
- `SecurityConfig` with CORS, stateless session, and method security

**Backend — Auth**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

**Backend — Regression Packs**
- Full CRUD for regression packs
- Excel import with diff detection (added / modified / unchanged / removed)
- Pack version listing and retrieval
- `ExcelImportService` — atomic transactional import, full validation

**Backend — Regression Tests**
- Test version listing per pack version

**Backend — Regression Sessions**
- Session creation with automatic execution result pre-population
- Session status transitions (PLANNED → IN_PROGRESS → COMPLETED / ABORTED)
- Individual and bulk execution result updates

**Backend — Attachments**
- File upload, listing, and deletion for execution results

**Backend — Reports**
- Session pass/fail summary with pass rate
- Pack-level trend report across sessions

**Backend — Common**
- `ApiResponse<T>` envelope for all responses
- `GlobalExceptionHandler` for centralized error handling
- `ResourceNotFoundException`, `ImportException`

**Dependencies added**
- `jjwt-api / jjwt-impl / jjwt-jackson` 0.12.6 — JWT
- `poi-ooxml` 5.3.0 — Excel parsing

### Documentation
- `docs/initialPlan.md` — full pre-implementation design plan
- `docs/architecture/system-architecture.md`
- `docs/architecture/backend-architecture.md`
- `docs/architecture/frontend-architecture.md`
- `docs/database/database-schema.md`
- `docs/database/entity-relationships.md`
- `docs/database/migrations.md`
- `docs/api/api-overview.md`
- `docs/requirements/functional-requirements.md`
- `docs/requirements/non-functional-requirements.md`
- `docs/decisions/architecture-decisions.md`

### Affected Modules
- `backend/regression-management-backend`
- `docs/`

### Technical Notes
- Spring Boot 4.1.0 (as configured in existing `build.gradle`)
- Java 21
- `ddl-auto=validate` — schema is owned by Flyway, not Hibernate
- Excel import is a single atomic transaction — partial imports cannot occur
- All test versions and pack versions are immutable by design
