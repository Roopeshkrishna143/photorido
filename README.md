# Photorido

Photorido is a marketplace platform that connects customers and photographers through discovery, bookings, messaging, payments, and role-based operations. This repository is now organized as a simple production-ready monorepo with independent frontend and backend applications, plus an `admin/` scaffold for the future dashboard.

## Folder Structure

```text
photorido/
  frontend/   React + Vite customer/vendor app
  backend/    Express + TypeScript API
  admin/      Placeholder app scaffold for the future admin dashboard
  docs/       Architecture, API, and handoff documentation
  .github/    CI/CD workflows, templates, and repo governance files
```

## Setup

1. Install frontend dependencies: `cd frontend && npm install`
2. Install backend dependencies: `cd ../backend && npm install`
3. Copy `backend/.env.example` to `backend/.env`
4. Optionally copy `frontend/.env.example` to `frontend/.env`
5. Start the backend: `npm run dev` from `backend/`
6. Start the frontend: `npm run dev` from `frontend/`

Root helper scripts are also available:

- `npm run dev:frontend`
- `npm run dev:backend`
- `npm run build:frontend`
- `npm run build:backend`
- `npm run build:admin`
- `npm run test:backend`

## Environment Variables

Frontend:

- `VITE_API_BASE_URL` defaults to `/api`

Backend:

- `PORT`
- `API_PREFIX`
- `MONGODB_URI`
- `FRONTEND_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- Optional provider/config values such as `GOOGLE_MAPS_API_KEY` and `MAILTRAP_*`

Environment files are ignored by Git. Only `*.env.example` files are intended to be committed.

## Branch Strategy

- `main` is the production branch
- `develop` is the staging/integration branch
- Use `feature/*` for new features
- Use `bugfix/*` for non-production bug fixes
- Use `hotfix/*` for urgent production fixes
- Use `release/*` for release hardening

Recommended flow:

1. Branch from `develop` for regular work
2. Open pull requests into `develop`
3. Promote tested release work from `develop` into `main`
4. Use `hotfix/*` from `main` only for urgent production issues

GitHub branch protection cannot be fully enforced from source files alone, so enable these in the repository settings after push:

- Require pull requests before merging to `main`
- Restrict direct pushes to `main`
- Require status checks from `CI`
- Require code owner review after the `CODEOWNERS` file is updated with your actual GitHub usernames or teams

## Deployment Flow

- The current UAT deployment target is branch `UAT`
- Backend deployment config is in `render.yaml`
- Frontend deployment config is in `frontend/vercel.json`
- See `docs/deployment.md` for the full Render, Vercel, and MongoDB Atlas setup

## Documentation

- See `docs/architecture.md` for the system design overview
- See `docs/api.md` for the backend API structure
- See `docs/deployment.md` for the deployment guide
- See `docs/PROJECT_HANDOFF_PROMPT.md` for the preserved handoff context from the earlier project state
