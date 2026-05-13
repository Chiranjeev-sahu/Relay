# Relay

Relay is a collaborative, web-native API client for teams. It combines workspace-based collaboration, role-aware permissions, environment management, request history, and a polished request/response composer into a single browser experience.

It is built as a full-stack TypeScript application with a Node.js/Express backend, a React/Vite frontend, PostgreSQL, Prisma, Google OAuth, and cookie-based authentication.

## Why Relay Stands Out

Relay is more than a demo CRUD app. It shows the kind of engineering choices that matter in production:

- Real multi-user workspaces with OWNER, ADMIN, MEMBER, and VIEWER roles.
- Secure auth using httpOnly cookies, Google OAuth, and email/password login.
- Environment-aware request execution with variable interpolation across URLs, headers, and bodies.
- Saved collections, reusable requests, and request history that can be searched, replayed, and cleared.
- A modular frontend architecture with React Query, Zustand, shadcn/ui, and resizable panels.
- Prisma-generated database types and Zod validation for type-safe backend boundaries.
- Deployment-aware configuration for a Render backend and Vercel frontend.

## Core Capabilities

- Create and manage workspaces for teams.
- Invite users and manage membership roles.
- Organize API calls into collections and saved requests.
- Define environments and environment variables for local, staging, and production targets.
- Compose requests with query parameters, headers, and JSON bodies.
- Send requests through the backend proxy and inspect live responses.
- Persist request history and reload previous calls into the composer.
- Try the product in guest mode before signing in.

## Architecture

Relay is split into two applications:

- Backend: Express API under `backend/`, with Prisma, PostgreSQL, Google OAuth, and route-level authorization.
- Frontend: React application under `frontend/`, with a workspace shell, auth screens, and feature-based UI modules.

### Backend Responsibilities

- Auth routes for register, login, logout, Google OAuth, and current-user lookup.
- Workspace routes for create, join, member management, role updates, invite code regeneration, and deletion.
- Collection routes for organizing saved requests.
- Environment routes for managing environment variables with secret masking for restricted roles.
- Request-history routes for listing and pruning saved execution history.
- Proxy route for sending outbound API calls and recording the result.

### Frontend Responsibilities

- Landing page with a product-oriented marketing flow and guest-mode entry point.
- Auth page for email/password and Google sign-in.
- Workspace shell with split panes, sidebar controls, theme switching, and user menus.
- Request composer with query params, headers, body editing, and validation.
- Response viewer for the result of the last request.
- Workspace panel for collections, members, environments, and history.

## Tech Stack

| Area       | Stack                                              |
| ---------- | -------------------------------------------------- |
| Backend    | Node.js, Express 5, TypeScript, Prisma, PostgreSQL |
| Auth       | httpOnly cookies, JWT, Google OAuth                |
| Validation | Zod                                                |
| Frontend   | React 19, Vite, TypeScript, React Router           |
| State      | React Query, Zustand                               |
| UI         | shadcn/ui, Radix UI, Tailwind CSS 4, lucide-react  |
| Tooling    | ESLint, Prettier, tsc-alias, Prisma migrations     |

## Project Structure

```text
Relay/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  └─ migrations/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ lib/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  └─ utils/
│  └─ generated/
└─ frontend/
	├─ src/
	│  ├─ app/
	│  ├─ components/
	│  ├─ features/
	│  ├─ layouts/
	│  ├─ pages/
	│  ├─ stores/
	│  └─ lib/
	└─ public/
```

## Getting Started

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

- `npm run dev` - Run the API in watch mode.
- `npm run build` - Compile TypeScript and rewrite aliases.
- `npm start` - Run the built server from `dist/src/server.js`.
- `npm run lint` - Lint backend source files.
- `npm run format` - Format the backend workspace.

### Frontend

- `npm run dev` - Start the Vite dev server.
- `npm run build` - Type-check and build the production bundle.
- `npm run lint` - Lint frontend source files.
- `npm run typecheck` - Run a TypeScript-only check.
- `npm run preview` - Preview the production build locally.

## Deployment Notes

Relay is already configured with deployment in mind:

- Backend build on Render: `npm install --include=dev && npx prisma generate && npm run build`
- Backend start on Render: `npm start`
- Frontend API URL on Vercel: set `VITE_API_URL` to the Render API URL ending in `/api/v1`
- Backend frontend origin: set `FRONTEND_URL` to the Vercel app URL
- Google OAuth callback must match the backend route exactly: `/api/v1/auth/google/callback`
- Production auth cookies are configured with `SameSite=None; Secure` so browser sessions work across frontend and backend origins

## Engineering Notes

- Prisma models are used to express the domain clearly: users, accounts, workspaces, members, collections, saved requests, environments, and request history.
- The backend enforces access control at the route level and masks sensitive environment values for restricted roles.
- The frontend keeps server state and local UI state separate, which makes the workspace predictable and easy to maintain.
- The UI is intentionally product-like, with resizable panels, theme switching, persistent drafts, and replayable history instead of a generic CRUD shell.
