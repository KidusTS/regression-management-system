# System Architecture

## Overview

The Regression Management System follows a standard client-server architecture with a stateless REST API backend and a Next.js frontend.

```
Browser (Next.js)
       │
       │  HTTP/JSON (JWT in Authorization header)
       ▼
Spring Boot REST API  (:8080)
       │
       │  JPA / Hibernate
       ▼
PostgreSQL Database
```

## Key Architectural Decisions

- Stateless backend — JWT is used for authentication. No server-side sessions.
- Immutability by design — Pack versions and test versions are never mutated after creation. New imports always produce new versions.
- Excel as source of truth — The system is designed to import from and export to Excel. Users are never locked into the UI for test editing.
- Feature-based packaging — Both backend and frontend are organized by feature, not by layer.

## Components

### Frontend
- Next.js (App Router)
- Communicates with the backend via Axios
- React Query for server state management
- Feature-based folder structure under `src/features/`

### Backend
- Spring Boot 3.x on Java 21
- Spring Security with JWT (stateless)
- Spring Data JPA with Hibernate
- Flyway for database migrations
- Apache POI for Excel parsing

### Database
- PostgreSQL
- Schema managed entirely by Flyway migrations
- `ddl-auto=validate` — Hibernate never modifies the schema

## Security Model

All endpoints except `/api/auth/**` require a valid JWT Bearer token.

Role-based access is enforced at the method level using `@PreAuthorize`.

Roles: `ADMIN`, `QA_LEAD`, `QA_ENGINEER`, `VIEWER`

## Deployment Topology (Current)

Single-host development setup:
- Frontend: `localhost:3000`
- Backend: `localhost:8080`
- Database: `localhost:5432`

CORS is configured to allow `localhost:3000` only.
