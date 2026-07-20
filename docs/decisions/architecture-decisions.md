# Architecture Decisions

## ADR-001: Immutable versioning for test data

**Decision:** Test versions and pack versions are never mutated after creation. Any change produces a new version.

**Reason:** Regression sessions must be historically accurate. If a test is modified after a session was run, the session must still reflect the exact test content that was executed. Mutable test data would make historical results unreliable.

---

## ADR-002: Excel as the primary editing format

**Decision:** Tests are imported from and exported to Excel. The application does not provide a full in-app test editor.

**Reason:** QA teams already maintain regression tests in Excel. Forcing them to migrate entirely to a new UI would create adoption friction and risk data loss. The system is designed to complement Excel workflows, not replace them.

---

## ADR-003: JWT for authentication (stateless)

**Decision:** Spring Security with JWT Bearer tokens. No server-side sessions.

**Reason:** Stateless authentication simplifies horizontal scaling and is the standard approach for REST APIs consumed by a separate frontend.

---

## ADR-004: pack_version_tests join table instead of copying test data

**Decision:** A pack version references test versions via a join table rather than copying test data into the version.

**Reason:** Copying data would create duplication and make it harder to trace a test's history across versions. The join table approach allows unchanged tests to be reused across versions while still maintaining immutability.

---

## ADR-005: Pre-populate execution results on session creation

**Decision:** When a session is created, one `RegressionExecutionResult` row is created per test in the pack version, all defaulting to `NOT_RUN`.

**Reason:** This ensures the session always has a complete record of all tests, even if some are never executed. It also makes progress tracking straightforward — count `NOT_RUN` to see how many tests remain.

---

## ADR-006: Soft delete for regression packs

**Decision:** Regression packs are soft-deleted (`is_active = false`) rather than hard-deleted.

**Reason:** Sessions reference pack versions which reference packs. Hard-deleting a pack would orphan historical session data. Soft delete preserves referential integrity while hiding the pack from active use.

---

## ADR-007: Feature-based package structure

**Decision:** Both backend and frontend are organized by feature (`regressionpack`, `regressionsession`, etc.) rather than by layer (`controllers`, `services`, etc.).

**Reason:** Feature-based organization keeps related code together, makes it easier to understand the scope of a change, and scales better as the application grows.

---

## ADR-008: JSONB for import_summary

**Decision:** The import diff summary (added/modified/unchanged/removed) is stored as JSONB on `regression_pack_versions`.

**Reason:** The summary is metadata about the import event, not a relational entity. JSONB avoids creating a separate table for a simple key-value structure and allows the shape to evolve without a migration.
