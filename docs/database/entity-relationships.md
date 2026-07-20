# Entity Relationships

## Relationship Map

```
User ──< RegressionPack (created_by)
User ──< RegressionPackVersion (created_by)
User ──< RegressionSession (created_by)
User ──< RegressionExecutionResult (executed_by)
User ──< Attachment (uploaded_by)
User ──< AuditLog (performed_by)

Role >──< User  (many-to-many via user_roles)

RegressionPack ──< RegressionPackVersion
RegressionPack ──< RegressionTest

RegressionTest ──< RegressionTestVersion

RegressionPackVersion >──< RegressionTestVersion  (many-to-many via pack_version_tests)

RegressionSession ──> RegressionPackVersion
RegressionSession ──< RegressionExecutionResult

RegressionExecutionResult ──> RegressionTestVersion
RegressionExecutionResult ──< Attachment
```

## Key Relationship Rules

### RegressionTest is the identity anchor
A `RegressionTest` represents the permanent identity of a test case within a pack, identified by its `test_id_ref` (the Test ID from Excel). It never changes. Only its versions change.

### RegressionTestVersion is immutable
Once created, a `RegressionTestVersion` is never updated. If a test changes in a new Excel import, a new `RegressionTestVersion` is created with an incremented `version_number`.

### pack_version_tests links exact versions
A `RegressionPackVersion` points to specific `RegressionTestVersion` rows via `pack_version_tests`. This is the mechanism that makes sessions immutable — a session references a pack version, which references frozen test versions.

### Sessions reference pack versions, not packs
A `RegressionSession` is always tied to a specific `RegressionPackVersion`, never to the pack itself. This ensures that if the pack is updated in the future, the session still reflects the exact tests that were run.

### Execution results are pre-populated
When a session is created, one `RegressionExecutionResult` row is created per test version in the referenced pack version. All start with `result = NOT_RUN`. QA engineers update them during execution.

### Soft deletes on packs
`RegressionPack` uses a soft delete (`is_active = false`). Versions, sessions, and results are never deleted.
