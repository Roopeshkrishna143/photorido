# Photorido Architecture

## Overview

Photorido is organized as a lightweight monorepo with independent deployment units for the customer-facing frontend and the backend API. The structure is designed to support a future admin dashboard without coupling it to the existing user application.

## Applications

### Frontend

- React + Vite application in `frontend/`
- Serves the marketplace, vendor, and user-facing flows
- Talks to the backend over HTTP and Socket.IO
- Uses the Vite development proxy to route `/api`, `/uploads`, and `/socket.io` traffic to the backend during local development

### Backend

- Express + TypeScript application in `backend/`
- Exposes REST-style APIs under `/api`
- Uses MongoDB via Mongoose
- Handles authentication, marketplace data, vendors, photographers, settings, uploads, and realtime messaging hooks
- Keeps startup concerns isolated in `src/startup/`

### Admin

- Reserved future application in `admin/`
- Currently a placeholder so the repo shape, CI pipeline, and deployment flow already account for the admin surface

## Runtime Design

1. The frontend runs independently on port `3000`
2. The backend runs independently on port `5000`
3. The frontend proxies API and websocket traffic to the backend in local development
4. The backend validates environment variables at startup and serves both API data and uploaded assets

## Backend Structure

- `src/config` contains environment parsing and database configuration
- `src/middleware` contains shared Express middleware
- `src/models` contains Mongoose schemas and models
- `src/modules` contains domain-focused route and service logic
- `src/realtime` contains Socket.IO wiring
- `src/routes` contains top-level route registration
- `src/startup` contains boot-time seeding and sync tasks

## Scaling Notes

- The monorepo keeps the frontend, backend, and future admin surface isolated so they can evolve or deploy separately
- Shared packages can be introduced later under a dedicated `packages/` directory if frontend/backend contract sharing becomes necessary
- GitHub workflows are defined at the root so validation and deployment rules remain consistent across apps
