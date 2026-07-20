# Regression Management System

A modern web application for managing regression testing across software releases.

Unlike traditional test management tools, this application focuses specifically on **Regression Packs**, **Regression Sessions**, and **Excel-based regression management**.

---

## Overview

Regression tests are typically maintained in Excel by QA teams.

This application allows teams to:

- Import regression packs from Excel
- Version regression packs
- Execute regression sessions against a specific software change
- Preserve historical regression executions
- Track pass/fail trends
- Export updated regression packs back to Excel

The goal is to improve the quality-of-life for QA engineers while maintaining compatibility with existing Excel workflows.

---

## Tech Stack

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- Flyway
- Gradle

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Axios
- React Hook Form
- Zod

---

## Project Structure

```
regression-management-system
│
├── backend/
├── frontend/
├── docs/
└── README.md
```

---

## Planned Features

### Regression Pack Management

- Import Excel files
- Export Excel files
- Version regression packs
- Compare regression pack versions
- Detect added, removed, and modified tests

---

### Regression Sessions

- Create sessions
- Associate sessions with software changes
- Execute regression tests
- Record results
- Add comments
- Upload attachments

---

### Dashboard

- Active regression sessions
- Recent releases
- Statistics
- Regression coverage

---

### Reporting

- Pass rate
- Failure trends
- Frequently failing tests
- Execution history

---

## Future Enhancements

- Jira Integration
- Azure DevOps Integration
- GitHub Integration
- Playwright Integration
- Selenium Integration
- Cypress Integration
- Email Notifications
- Role-Based Permissions
- Audit Logs

---

## Getting Started

### Backend

```bash
cd backend
./gradlew bootRun
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Development Workflow

1. Import Regression Pack
2. Create Regression Pack Version
3. Create Regression Session
4. Execute Regression Tests
5. Analyze Results
6. Generate Reports

---

## Architecture

The application follows a client-server architecture.

Frontend

- Next.js
- TypeScript

↓

Backend

- Spring Boot REST API

↓

Database

- PostgreSQL

---

## License

This project is intended for educational and portfolio purposes unless otherwise specified.
