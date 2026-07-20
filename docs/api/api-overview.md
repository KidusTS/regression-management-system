# API Overview

## Base URL

```
http://localhost:8080/api
```

## Authentication

All endpoints except `/api/auth/login` and `/api/auth/register` require a JWT Bearer token.

Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are obtained from `POST /api/auth/login` and expire after 24 hours.

## Response Format

All responses follow the same envelope:

```json
{
  "success": true,
  "message": null,
  "data": { }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "data": null
}
```

Validation errors return HTTP 400 with field-level details in `data`:

```json
{
  "success": true,
  "message": "Validation failed",
  "data": {
    "email": "must be a well-formed email address",
    "password": "size must be between 8 and 2147483647"
  }
}
```

## Endpoint Summary

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login — returns JWT |
| POST | `/auth/register` | Register new user |
| GET | `/auth/me` | Get current authenticated user |

### Regression Packs
| Method | Path | Description |
|---|---|---|
| GET | `/regression-packs` | List all active packs |
| POST | `/regression-packs` | Create a new pack |
| GET | `/regression-packs/{id}` | Get pack by ID |
| PUT | `/regression-packs/{id}` | Update pack metadata |
| DELETE | `/regression-packs/{id}` | Soft delete pack |
| GET | `/regression-packs/{id}/versions` | List all versions of a pack |
| GET | `/regression-packs/{id}/versions/{versionId}` | Get a specific version |
| POST | `/regression-packs/{id}/import` | Import Excel file → creates new version |

### Regression Tests
| Method | Path | Description |
|---|---|---|
| GET | `/regression-packs/{id}/versions/{versionId}/tests` | List all tests in a version |

### Regression Sessions
| Method | Path | Description |
|---|---|---|
| GET | `/regression-sessions` | List all sessions |
| POST | `/regression-sessions` | Create a new session |
| GET | `/regression-sessions/{id}` | Get session by ID |
| PUT | `/regression-sessions/{id}/status` | Update session status |
| GET | `/regression-sessions/{id}/results` | Get all execution results |
| PUT | `/regression-sessions/{id}/results/{resultId}` | Update a single result |
| PUT | `/regression-sessions/{id}/results/bulk` | Bulk update results |

### Attachments
| Method | Path | Description |
|---|---|---|
| POST | `/results/{resultId}/attachments` | Upload attachment to a result |
| GET | `/results/{resultId}/attachments` | List attachments for a result |
| DELETE | `/attachments/{id}` | Delete an attachment |

### Reports
| Method | Path | Description |
|---|---|---|
| GET | `/reports/sessions/{id}/summary` | Pass/fail summary for a session |
| GET | `/reports/packs/{id}/trends` | Pass rate trends across sessions for a pack |

## Excel Import

`POST /api/regression-packs/{id}/import`

- Content-Type: `multipart/form-data`
- Field name: `file`
- Accepted format: `.xlsx`

Expected columns (in order):

| Column Index | Name |
|---|---|
| 0 | Module |
| 1 | Feature |
| 2 | Test ID (required) |
| 3 | Test Title (required) |
| 4 | Preconditions |
| 5 | Test Steps (required) |
| 6 | Expected Result (required) |
| 7 | Priority |
| 8 | Automation Status |
| 9 | Status |

On success, returns an `ImportResultDto`:

```json
{
  "newVersionId": "uuid",
  "versionNumber": 2,
  "added": 5,
  "modified": 3,
  "unchanged": 97,
  "removed": 1,
  "total": 105
}
```
