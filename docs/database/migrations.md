# Database Migrations

Migrations are managed by Flyway. Files live in `backend/src/main/resources/db/migration/`.

Naming convention: `V{version}__{description}.sql`

## Migration History

| Version | File | Description |
|---|---|---|
| V1 | `V1__init_schema.sql` | Initial schema — all tables, indexes, and seed roles |

## Notes

- `spring.flyway.baseline-on-migrate=true` is set to allow Flyway to run on an existing database.
- Migrations are append-only. Never modify an existing migration file.
- To make a schema change, create a new migration file with the next version number.
