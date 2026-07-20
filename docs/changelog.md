# Changelog

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
