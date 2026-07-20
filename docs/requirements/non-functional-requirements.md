# Non-Functional Requirements

## Immutability

- Pack versions must never be modified after creation.
- Test versions must never be modified after creation.
- Execution results may only have `result` and `comment` updated — the test version they reference is fixed.
- Historical session data must remain unchanged regardless of future pack changes.

## Data Integrity

- The Excel import is a single atomic transaction. Partial imports must not occur.
- Duplicate test IDs within an import must be rejected before any data is written.

## Security

- All endpoints except login and register require authentication.
- Passwords are hashed with BCrypt.
- JWT tokens are signed with HMAC-SHA256.
- CORS is restricted to the frontend origin.

## Compatibility

- The system must remain compatible with Excel-based workflows.
- Users must never be forced to edit tests exclusively inside the application.
- Exported Excel files must be importable back into the system without data loss.

## Performance

- The system should handle regression packs with up to 1,000 tests per version without degradation.
- Bulk result updates should complete in a single request.

## Maintainability

- Database schema changes must be made via Flyway migrations only.
- No business logic in controllers or repositories.
- DTOs must be used for all API input and output — entities must never be serialized directly.
