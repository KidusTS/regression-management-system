# Functional Requirements

## Authentication

- Users must log in with email and password to access the system.
- Registration creates a user with the `QA_ENGINEER` role by default.
- JWT tokens expire after 24 hours.

## Regression Pack Management

- Users can create regression packs with a name, description, and project.
- Regression packs can be soft-deleted (not permanently removed).
- A regression pack has one or more versions.
- Versions are created by importing an Excel file.
- Each import creates a new version — it never overwrites an existing one.
- The system detects added, modified, unchanged, and removed tests between imports.
- The import result summary (added/modified/unchanged/removed counts) is stored on the version.

## Excel Import

- The system accepts `.xlsx` files.
- Required columns: Test ID, Test Title, Test Steps, Expected Result.
- Duplicate Test IDs within the same file cause the entire import to be rejected.
- An empty sheet causes the import to be rejected.
- Invalid priority values default to `MEDIUM`.
- Invalid automation status values default to `MANUAL`.
- Invalid status values default to `ACTIVE`.

## Regression Sessions

- A session is created against a specific pack version.
- Creating a session pre-populates one execution result per test in the pack version, all set to `NOT_RUN`.
- Session status transitions: `PLANNED` → `IN_PROGRESS` → `COMPLETED` or `ABORTED`.
- Setting status to `IN_PROGRESS` records `started_at`.
- Setting status to `COMPLETED` or `ABORTED` records `completed_at`.
- Execution results can be updated individually or in bulk.
- Each result records who executed it and when.

## Attachments

- Files can be attached to individual execution results.
- Attachments are stored on disk and referenced by path in the database.
- Attachments can be deleted.

## Reports

- A session summary returns total, passed, failed, blocked, skipped, not-run counts and pass rate.
- A pack trend report returns pass rate history across all sessions for a given pack.
