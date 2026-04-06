# API Structure Overview

## Base URL

- Local API base: `http://localhost:5000/api`
- Frontend default proxy base: `/api`

## Top-Level Routes

- `GET /api` - API readiness response
- `GET /api/health` - application health status
- `GET|PATCH /api/settings/*` - application settings endpoints
- `GET|POST /api/site/*` - site content and public utility endpoints
- `POST /api/auth/*` - authentication and account flows
- `GET|POST|PATCH|DELETE /api/marketplace/*` - marketplace domain operations
- `GET|POST|PATCH|DELETE /api/vendors/*` - vendor schedules, analytics, and vendor-owned data
- `GET /api/photographers/*` - public photographer discovery endpoints
- `POST /api/uploads/*` - upload-related endpoints

## Domain Areas

### Auth

- Login, registration, profile, logout, refresh-token, and OTP-related flows

### Marketplace

- Categories and sub-categories
- Listings and listing moderation
- Bookings
- Reviews
- Favorites
- Conversations and messaging
- User management and RBAC helpers

### Vendors

- Vendor schedule management
- Vendor analytics and profile-owned operations

### Photographers

- Public photographer search
- Photographer detail views
- Availability lookups

### Realtime

- Socket.IO endpoint under `/socket.io`
- Designed for conversation and notification events

## Response Pattern

Most routes use a JSON envelope with fields such as:

- `success`
- `message`
- `data`

This keeps frontend integration predictable and leaves room for consistent error formatting through the shared Express middleware layer.
