# Backend Architecture

## Package Structure

```
com.regression/
│
├── config/              Spring Security, CORS, JPA config beans
├── security/            JWT service, JWT filter, UserDetailsService
├── common/
│   ├── exception/       GlobalExceptionHandler + custom exceptions
│   └── response/        ApiResponse<T> wrapper
│
├── auth/                Login, register, /me endpoints
├── user/                User and Role entities + repositories
│
├── regressionpack/      Pack CRUD + Excel import → versioning
├── regressiontest/      Test version queries
├── regressionsession/   Session lifecycle + execution result recording
├── attachment/          File upload/download for execution results
└── report/              Pass rate summaries and trend reports
```

## Layer Responsibilities

Each feature package follows the same internal structure:

| Layer | Responsibility |
|---|---|
| `entity` | JPA-mapped database table. Never exposed directly to clients. |
| `repository` | Spring Data JPA interface. Query methods only — no business logic. |
| `dto` | Data transfer objects for request/response. Validated with Bean Validation. |
| `service` | All business logic lives here. Transactions are managed at this layer. |
| `controller` | Thin HTTP layer. Delegates to service, wraps response in `ApiResponse<T>`. |

## ApiResponse Wrapper

All endpoints return:

```json
{
  "success": true,
  "message": null,
  "data": { ... }
}
```

Errors return:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null
}
```

## Exception Handling

`GlobalExceptionHandler` handles all exceptions centrally:

| Exception | HTTP Status |
|---|---|
| `ResourceNotFoundException` | 404 |
| `ImportException` | 422 |
| `MethodArgumentNotValidException` | 400 |
| `BadCredentialsException` | 401 |
| `AccessDeniedException` | 403 |
| `Exception` (catch-all) | 500 |

## Immutability Enforcement

- `RegressionTestVersion` and `RegressionPackVersion` have no update endpoints.
- The Excel import service always creates new versions — it never modifies existing ones.
- `RegressionExecutionResult` records are pre-populated when a session is created and can only have their `result` and `comment` fields updated.

## Transaction Boundaries

Transactions are opened at the service layer using `@Transactional`.

The Excel import is a single transaction — if any part fails, the entire import is rolled back and no partial version is created.

## Dependencies Added

| Dependency | Purpose |
|---|---|
| `jjwt-api / jjwt-impl / jjwt-jackson` | JWT generation and validation |
| `poi-ooxml` | Excel (.xlsx) parsing via Apache POI |
