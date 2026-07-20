# Frontend Architecture

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Axios (HTTP client)
- React Query (server state)
- React Hook Form + Zod (forms and validation)

## Folder Structure

```
src/
├── app/                    Next.js App Router pages and layouts
│
├── features/               Feature-based modules
│   ├── auth/
│   │   ├── components/     LoginForm, RegisterForm
│   │   ├── hooks/          useLogin, useRegister
│   │   ├── services/       auth.service.ts
│   │   ├── types/          auth.types.ts
│   │   └── schemas/        auth.schemas.ts (Zod)
│   │
│   ├── regression-packs/
│   │   ├── components/     PackList, PackCard, ImportModal, VersionList
│   │   ├── hooks/          usePacks, usePackVersions, useImportPack
│   │   ├── services/       packs.service.ts
│   │   ├── types/          pack.types.ts
│   │   └── schemas/        pack.schemas.ts
│   │
│   ├── regression-sessions/
│   │   ├── components/     SessionList, SessionDetail, ResultsTable, BulkUpdateBar
│   │   ├── hooks/          useSessions, useSessionResults, useUpdateResult
│   │   ├── services/       sessions.service.ts
│   │   ├── types/          session.types.ts
│   │   └── schemas/        session.schemas.ts
│   │
│   └── reports/
│       ├── components/     SummaryCard, TrendChart
│       ├── hooks/          useSessionSummary, usePackTrends
│       ├── services/       reports.service.ts
│       └── types/          report.types.ts
│
├── components/
│   ├── layout/             Sidebar, Header, PageWrapper
│   └── ui/                 shadcn/ui components
│
├── services/
│   └── api.ts              Axios instance with JWT interceptor
│
├── hooks/                  Shared hooks (useAuth, useCurrentUser)
├── providers/              QueryClientProvider, AuthProvider
├── types/                  Shared types
└── utils/                  Shared utilities
```

## API Communication

All HTTP calls go through a single Axios instance in `services/api.ts`.

The instance automatically attaches the JWT from localStorage to every request via a request interceptor.

On 401 responses, the interceptor clears the token and redirects to `/login`.

## State Management

- Server state (API data) is managed by React Query.
- Auth state (current user, token) is managed via React Context.
- Form state is managed locally with React Hook Form + Zod schemas.

## Authentication Flow

1. User submits login form
2. `POST /api/auth/login` returns JWT + user info
3. Token stored in localStorage
4. Axios interceptor attaches token to all subsequent requests
5. React Query refetches protected data automatically
