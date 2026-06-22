# Relay

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-000000?logo=express" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
  <a href="https://relay-omega-roan.vercel.app"><img alt="Live Demo" src="https://img.shields.io/badge/Live_Demo-0288D1?logo=vercel" /></a>
</p>

Relay is a collaborative, web-native API client for teams. It combines workspace-based collaboration, role-aware permissions, environment management, request history, and a polished request/response composer into a single browser experience.

Built with Node.js/Express, React/Vite, PostgreSQL, Prisma, Google OAuth, and cookie-based authentication.

> [relay-omega-roan.vercel.app](https://relay-omega-roan.vercel.app)

## Why Relay Stands Out

- **Multi-user workspaces with true RBAC** — four tiers (OWNER, ADMIN, MEMBER, VIEWER) enforced at both the API route level and the UI.
- **Secure-by-design auth** — httpOnly JWT cookies prevent XSS token theft, Google OAuth for social login, bcrypt password hashing.
- **Environment-aware proxy execution** — define variables per workspace, interpolate them across URLs, headers, and bodies server-side, with secret masking by role.
- **Saved collections and request history** — organize requests into collections, replay past executions, search and clear history.
- **Modular frontend architecture** — TanStack Query for server state, Zustand for UI state, shadcn/ui for components, resizable panels for layout.
- **Type-safe end to end** — Prisma-generated database types, Zod validation at API boundaries, strict TypeScript on both backend and frontend.
- **Deployment-ready** — configured for Render (backend) and Vercel (frontend) with environment-specific CORS and cookie settings.

## Features

| Category | Details |
|---|---|
| **Workspaces** | Create, join, and manage workspaces. Invite members via unique code. 4-tier RBAC (OWNER, ADMIN, MEMBER, VIEWER). |
| **Request Composer** | HTTP method selector, URL bar, query params editor, headers editor, JSON body editor with validation, cURL export, keyboard shortcuts (Ctrl+S to save to a collection). |
| **Proxy Engine** | Requests are sent server-side via Axios. Supports variable interpolation (`{{key}}`) across URLs, headers, and bodies. Captures timing, response size, status, and headers. |
| **Collections** | Group saved requests into named collections. CRUD gated by role (VIEWER read, MEMBER create/edit, ADMIN delete). |
| **Environments** | Per-workspace variable namespaces. Secret values masked for restricted roles (VIEWER, MEMBER). Substituted into proxy requests at runtime. |
| **History** | All proxied requests are persisted. Paginated listing (cursor-based), single delete, full clear. Replay previous requests back into the composer. |
| **Auth** | Email/password registration with automatic workspace and collection creation. Google OAuth with CSRF state parameter. httpOnly JWT cookies. |
| **UI** | Resizable panels, light/dark/system theme with keyboard shortcut (`D`), sonner toasts, framer-motion animations, custom dot matrix loading screen. |
| **Guest Mode** | Try the app without signing in — compose and proxy requests without an account. |

## Tech Stack

| Area | Technology |
|---|---|
| **Backend** | Node.js, Express 5, TypeScript 5.9, Prisma 7 ORM |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth** | bcrypt, JWT (jsonwebtoken), httpOnly cookies, Google OAuth 2.0 |
| **Validation** | Zod 4.3 (env vars, request bodies, API boundaries) |
| **Frontend** | React 19, Vite 7, TypeScript 5.9 |
| **Routing** | React Router 7 with route-level code splitting (`React.lazy`) |
| **Server State** | TanStack Query 5 (caching, deduplication, mutations) |
| **UI State** | Zustand 5 with `persist` middleware (localStorage) |
| **UI Components** | shadcn/ui (Radix primitives), Tailwind CSS 4, framer-motion, lucide-react |
| **HTTP Client** | Axios (frontend API client and backend proxy engine) |
| **Linting / Formatting** | ESLint 9/10, Prettier 3.8 |
| **Deployment** | Render (backend web service), Vercel (frontend SPA) |

## Database Schema

![Entity Relationship Diagram](./backend/ERD.svg)

Nine models and one enum define the data layer:

| Model | Purpose | Key Relationships |
|---|---|---|
| `User` | Authentication and identity | Has workspaces via `WorkspaceMember`, requests via `Request` |
| `Account` | OAuth provider links | Belongs to `User`; supports multiple providers per user |
| `Workspace` | Collaboration unit | Has `WorkspaceMember`, `Collection`, `Environment`, `Request` |
| `WorkspaceMember` | User-role binding | Unique per `workspaceId` + `userId`; role drives all access control |
| `Collection` | Request grouping | Belongs to `Workspace`; name unique per workspace |
| `CollectionRequest` | Saved API request | Belongs to `Collection`; stores method, URL, headers, body |
| `Request` | Execution history | Optionally linked to `User`, `Workspace`, or `CollectionRequest` |
| `Environment` | Variable namespace | Belongs to `Workspace` |
| `EnvironmentVariable` | Key-value pair | Secret flag enables role-masked values; unique per environment |

**Enum `Role`:** `OWNER` > `ADMIN` > `MEMBER` > `VIEWER` — used by the `checkWorkspaceAccess` middleware to gate every workspace-scoped route.

## API Reference

All routes are prefixed with `/api/v1`. Routes under `/workspaces` share the path prefix — for example `POST /workspaces/:workspaceId/collections` resolves to `POST /api/v1/workspaces/:workspaceId/collections`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register with email, username, password. Creates default workspace and collection inside a Prisma transaction. |
| POST | `/auth/login` | — | Login with email and password. Sets httpOnly JWT cookie (7 day expiry). |
| POST | `/auth/logout` | — | Clears auth cookie. |
| GET | `/auth/google` | — | Redirects to Google OAuth 2.0 consent screen with CSRF state parameter. |
| GET | `/auth/google/callback` | — | Handles OAuth callback. Creates or links provider account, redirects to `/workspace`. |
| GET | `/auth/me` | Required | Returns the authenticated user's profile (excluding password hash). |

### Workspaces

| Method | Path | Min Role | Description |
|---|---|---|---|
| GET | `/workspaces` | Authenticated | List all workspaces the user belongs to (includes their role and invite code). |
| POST | `/workspaces` | Authenticated | Create a new workspace. Creator is added as OWNER. |
| POST | `/workspaces/join` | Authenticated | Join a workspace using its invite code. |
| GET | `/workspaces/:workspaceId/members` | VIEWER | List workspace members with their roles and join dates. |
| PATCH | `/workspaces/:workspaceId/members/:memberId/role` | ADMIN | Change a member's role. Cannot change the OWNER role. |
| DELETE | `/workspaces/:workspaceId/members/:memberId` | ADMIN | Remove a member from the workspace. |
| POST | `/workspaces/:workspaceId/invite/regenerate` | OWNER | Generate a new invite code. Previous code is invalidated. |
| DELETE | `/workspaces/:workspaceId` | OWNER | Delete the workspace and all associated data (cascading). |

### Collections

| Method | Path | Min Role | Description |
|---|---|---|---|
| GET | `/workspaces/:workspaceId/collections` | VIEWER | List all collections in a workspace. |
| GET | `/workspaces/:workspaceId/collections/:collectionId` | VIEWER | Get a single collection by ID. |
| POST | `/workspaces/:workspaceId/collections` | MEMBER | Create a new collection with a name and optional description. |
| PUT | `/workspaces/:workspaceId/collections/:collectionId` | MEMBER | Update collection name or description. |
| DELETE | `/workspaces/:workspaceId/collections/:collectionId` | ADMIN | Delete a collection and all its saved requests. |

### Collection Requests

| Method | Path | Min Role | Description |
|---|---|---|---|
| GET | `/workspaces/:workspaceId/collections/:collectionId/requests` | VIEWER | List all saved requests in a collection. |
| POST | `/workspaces/:workspaceId/collections/:collectionId/requests` | MEMBER | Save a request (method, URL, headers, body) to a collection. |
| PUT | `/workspaces/:workspaceId/collections/:collectionId/requests/:requestId` | MEMBER | Update a saved request's fields. |
| DELETE | `/workspaces/:workspaceId/collections/:collectionId/requests/:requestId` | MEMBER | Delete a saved request from the collection. |

### Environments

| Method | Path | Min Role | Description |
|---|---|---|---|
| GET | `/workspaces/:workspaceId/environments` | VIEWER | List all environments. Secret variable values are masked for non-ADMIN roles. |
| GET | `/workspaces/:workspaceId/environments/:envId` | VIEWER | Get a single environment with its variables. |
| POST | `/workspaces/:workspaceId/environments` | ADMIN | Create a new environment. |
| PUT | `/workspaces/:workspaceId/environments/:envId` | ADMIN | Update environment name. |
| DELETE | `/workspaces/:workspaceId/environments/:envId` | ADMIN | Delete an environment and all its variables (cascading). |
| POST | `/workspaces/:workspaceId/environments/:envId/variables` | ADMIN | Add a variable (key, value, secret flag, optional description). |
| PUT | `/workspaces/:workspaceId/environments/:envId/variables/:varId` | ADMIN | Update a variable's key, value, secret flag, or description. |
| DELETE | `/workspaces/:workspaceId/environments/:envId/variables/:varId` | ADMIN | Remove a variable from the environment. |

### Request History

| Method | Path | Min Role | Description |
|---|---|---|---|
| GET | `/workspaces/:workspaceId/requests` | VIEWER | Paginated request history. Accepts `cursor` and `limit` (default 20) query params. |
| DELETE | `/workspaces/:workspaceId/requests/:requestId` | MEMBER | Delete a single history entry. |
| DELETE | `/workspaces/:workspaceId/requests/clear` | ADMIN | Clear all history entries for the workspace. |

### Proxy

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/proxy` | Optional | Execute an outbound HTTP request server-side. Authenticated requests are saved to history. Supports environment variable interpolation. |

**Proxy request body:**

```json
{
  "method": "GET",
  "url": "https://api.example.com/users",
  "headers": { "Authorization": "Bearer {{api_token}}" },
  "body": {},
  "environmentId": "uuid-or-null",
  "workspaceId": "uuid-or-null",
  "collectionRequestId": null
}
```

## Architecture

Relay is split into two independently deployable applications.

### Backend

```
Request
  → helmet (security headers)
  → morgan (request logging)
  → express.json() (body parsing)
  → cors (origin restricted to FRONTEND_URL)
  → cookieParser
  → routes
    → verify (JWT cookie extraction + validation)
    → checkWorkspaceAccess (RBAC rank check)
    → controller (business logic)
    → Prisma (database)
    → Response
  → errorHandler (unified: AppError / ZodError / Prisma / JWT / SyntaxError)
```

The backend is an Express 5 API with route-level authorization middleware. Each workspace-scoped route checks the requester's role against a minimum threshold using a rank map (`VIEWER=0, MEMBER=1, ADMIN=2, OWNER=3`). Controllers use Prisma for database access, Zod for request body validation, and the `asyncHandler` wrapper for automatic error propagation to the unified `errorHandler`.

### Frontend

```
Pages (lazy loaded)
  → Feature modules (auth, workspace, collections, environments, history, composer)
    → TanStack Query hooks (server state: queries + mutations)
      → Axios client (api-client.ts with baseURL + withCredentials)
    → Zustand stores (UI state: active workspace, composer draft, response pane)
      → localStorage persistence (theme, workspace preferences)
    → shadcn/ui components + Tailwind CSS 4
```

The frontend separates **server state** (auth, workspaces, collections, environments, history) managed by TanStack Query from **UI state** (active workspace, panel layout, composer draft, response viewer) managed by Zustand. Routes use `React.lazy` with `Suspense` for code splitting.

### State Management Strategy

| Layer | Technology | What It Holds |
|---|---|---|
| Server state | TanStack Query 5 | Auth, workspaces, members, collections, environments, history |
| UI state | Zustand 5 | Active workspace/collection/environment, panel open/close, composer draft, response viewer |
| Persisted state | Zustand `persist` middleware | Theme preference (light/dark/system), workspace selections (localStorage) |

## Project Structure

```
Relay/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema — 9 models + 1 enum
│   │   └── migrations/            # Prisma migration history
│   ├── src/
│   │   ├── controllers/           # Route handlers (7 files)
│   │   ├── lib/                   # Prisma client, env config, token, cookie, CORS, interpolate
│   │   ├── middleware/            # JWT verify, RBAC check, unified error handler
│   │   ├── routes/                # Express routers (7 files)
│   │   └── utils/                 # AppError class, asyncHandler wrapper
│   └── generated/prisma/          # Prisma client types (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── app/                   # Providers (ErrorBoundary, QueryClient, Theme, Toaster)
│   │   ├── components/            # UI primitives (shadcn/ui), theme provider, landing, loaders
│   │   ├── features/              # Feature modules (auth, workspace, collections, envs, history, composer, response)
│   │   ├── layouts/               # App shell with resizable panels
│   │   ├── pages/                 # Route-level entry points (Home, Auth, Workspace)
│   │   ├── stores/                # UI-only Zustand stores
│   │   └── lib/                   # Axios client, cn() utility, role guards, formatters
│   └── dist/                      # Production build output
├── README.md
├── DEPLOYMENT_FIXES.md            # Deployment debugging walkthrough
├── MANUAL_TEST_PLAN.md            # Manual end-to-end test plan
└── frontend/FRONTEND_MAP.md       # Frontend architecture guide
```

## Getting Started

### Quick Start

```bash
# Terminal 1 — Backend
cd backend
npm install
# Create backend/.env with your database URL, JWT secret, and Google OAuth credentials (see below)
npx prisma generate
npx prisma migrate dev
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
# Create frontend/.env with VITE_API_URL (see below)
npm run dev
```

### Prerequisites

- Node.js 20 or newer
- PostgreSQL
- Google OAuth credentials for sign-in

### 1) Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/relay
JWT_SECRET=your-long-random-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

Then prepare Prisma and start the API:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 2) Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

Then start the UI:

```bash
npm run dev
```

### 3) Open the App

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api/v1`

## Available Scripts

### Backend

- `npm run dev` — Run the API in watch mode with tsx.
- `npm run build` — Compile TypeScript and resolve path aliases via tsc-alias.
- `npm start` — Run the compiled server from `dist/src/server.js`.
- `npm run lint` — Lint backend source files with ESLint.
- `npm run lint:fix` — Lint and auto-fix backend source files.
- `npm run format` — Format all backend files with Prettier.
- `npm run format:check` — Check formatting without writing changes.

### Frontend

- `npm run dev` — Start the Vite dev server.
- `npm run build` — Type-check (tsc -b) and build the production bundle (vite build).
- `npm run lint` — Lint frontend source files with ESLint.
- `npm run format` — Format frontend source files with Prettier.
- `npm run typecheck` — Run TypeScript type checking without emitting files.
- `npm run preview` — Preview the production build locally.

## Deployment Notes

Relay is already configured with deployment in mind:

- Backend build on Render: `npm install --include=dev && npx prisma generate && npm run build`
- Backend start on Render: `npm start`
- Frontend API URL on Vercel: set `VITE_API_URL` to the Render API URL ending in `/api/v1`
- Backend frontend origin: set `FRONTEND_URL` to the Vercel app URL
- Google OAuth callback must match the backend route exactly: `/api/v1/auth/google/callback`
- Production auth cookies are configured with `SameSite=None; Secure` so browser sessions work across the frontend and backend origins

> See [DEPLOYMENT_FIXES.md](./DEPLOYMENT_FIXES.md) for a detailed walkthrough of every deployment error encountered and resolved during initial Render + Vercel setup.

## Engineering Decisions

- **httpOnly cookies over localStorage tokens** — prevents XSS-based token theft. The cookie is set by the server with `httpOnly`, `SameSite`, and `Secure` (in production) flags. The frontend never has programmatic access to the token string.
- **TanStack Query + Zustand split** — server state (auth, workspaces, collections, environments, history) lives in TanStack Query for caching, deduplication, and automatic refetching. UI-only state (panel layout, composer draft, response pane) stays in Zustand with optional localStorage persistence. This avoids mixing concerns and keeps the query cache predictable.
- **4-tier RBAC (OWNER > ADMIN > MEMBER > VIEWER)** — covers the full spectrum from read-only access (VIEWER) to full ownership. Enforced at both the backend route level (via `checkWorkspaceAccess` middleware with a ROLE_RANK map) and the frontend UI level (via `role-guards.ts` with an action matrix). Duplicated enforcement prevents unauthorized mutations even if the UI is bypassed.
- **Prisma for the data layer** — auto-generated TypeScript types eliminate the ORM mapping gap, the migration system tracks schema changes deterministically, and the ERD generator produces visual documentation automatically.
- **Server-side request proxy** — the frontend never sends requests directly to external APIs. All requests go through Relay's proxy, which enables environment variable interpolation server-side, captures response timing and size, saves execution history, and avoids cross-origin issues entirely.
- **Route-level code splitting** — each page (Home, Auth, Workspace) is loaded via `React.lazy` with `Suspense`, reducing the initial JavaScript bundle and improving load time on the deployed Vercel app.
- **Unified error handling** — all backend errors pass through a single `errorHandler` middleware that distinguishes operational errors (`AppError`, `ZodError`, Prisma known errors, JWT errors, JSON parse errors) from unexpected programmer errors, returning appropriate HTTP status codes and sanitized messages.

## License

MIT
