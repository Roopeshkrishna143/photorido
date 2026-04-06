# Photorido Backend

Standalone Node.js + MongoDB backend for the Photorido front-end.

## Stack

- Node.js
- Express
- MongoDB with Mongoose
- TypeScript

## Quick Start

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Start the dev server with `npm run dev`

## Scripts

- `npm run dev` - start the backend in watch mode
- `npm run build` - compile TypeScript to `dist/`
- `npm run start` - run the compiled server
- `npm run check` - run TypeScript type checking

## Initial Structure

- `src/config` - env parsing and database connection
- `src/routes` - API routes
- `src/middleware` - shared Express middleware
- `src/modules` - feature modules like auth, marketplace, vendors, and photographers
- `src/models` - Mongoose models
- `src/startup` - startup tasks like seeding
- `src/app.ts` - app factory
- `src/server.ts` - process entry point

## Seeded Login Accounts

- Super Admin: `superadmin@photorido.com` / `password`
- Vendor: `vendor@photorido.com` / `password`
- User: `user@photorido.com` / `password`

## Auth Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`

## Marketplace Endpoints

- `GET|POST|PATCH|DELETE /api/marketplace/categories`
- `GET|POST|PATCH|DELETE /api/marketplace/sub-categories`
- `GET /api/marketplace/notifications`
- `POST /api/marketplace/notifications/read-all`
- `GET|POST /api/marketplace/listings`
- `POST /api/marketplace/listings/:listingId/approve`
- `POST /api/marketplace/listings/:listingId/reject`
- `POST /api/marketplace/location/resolve`
- `GET /api/marketplace/users`

## Vendor Endpoints

- `GET /api/vendors/me/schedules`
- `POST /api/vendors/me/schedules`
- `PATCH /api/vendors/me/schedules/:slotId`
- `DELETE /api/vendors/me/schedules/:slotId`
- `GET /api/vendors/me/analytics`

## Public Photographer Endpoints

- `GET /api/photographers`
- `GET /api/photographers/:photographerId`
- `GET /api/photographers/:photographerId/availability`

## Environment Notes

- `JSON_BODY_LIMIT` defaults to `20mb` so base64 profile/media payloads can be accepted during development.
- `GOOGLE_MAPS_API_KEY` is optional, but required if you want the backend to fully resolve Google Place IDs and auto-fill address fields from Google geocoding.

## Security Notes

- Passwords are hashed with bcrypt before storing in MongoDB
- JWT auth is supported with secure HttpOnly cookie support
- Login and registration routes are rate-limited
- Helmet headers are enabled
- Real transport security still requires HTTPS/TLS in deployment
