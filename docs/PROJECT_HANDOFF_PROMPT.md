# Project Continuation Prompt

Use this file when handing the repo to another AI assistant or continuing work in a future session. This prompt reflects the current real state of the Photorido repo after the shared marketplace lifecycle, super-admin management implementation, listing moderation flow, and dashboard responsiveness fixes.

## Master Handoff Prompt

```text
You are continuing work on an existing project in the current workspace. This is not a greenfield build and not just a Figma export anymore. Do not restart the app, do not re-scaffold it, and do not replace stable architecture unless the task explicitly requires it.

Project name:
Photorido

Current technical baseline:
- React 18
- Vite
- TypeScript / TSX
- `react-router` with `createBrowserRouter`
- Radix UI + reusable shadcn-style UI components
- Shared dashboard/sidebar patterns
- Mock auth with React Context and `localStorage`
- Shared marketplace mock state with Context + `localStorage`
- Frontend-only prototype behavior with mock/local data

Current product state:
Photorido is a multi-page photographer marketplace frontend prototype. It currently includes:
- public marketing pages
- services and discovery pages
- photographer search flow
- photographer detail/profile pages
- mock authentication
- role-based dashboards
- shared booking lifecycle across user and vendor dashboards
- in-app notifications
- shared listing moderation flow
- super-admin management sections
- a mobile preview route

Current route structure:
- Standalone:
  - `/dashboard`
  - `/mobile`
- Public routes under shared layout:
  - `/`
  - `/services`
  - `/how-it-works`
  - `/search`
  - `/photographer/:id`
  - `/help`
  - `/our-story`
  - `/careers`
  - `/press`
  - `/safety`
  - `/contact`
  - `/resources`
  - `/community`
  - `/pro-benefits`
  - `/privacy`
  - `/terms`
  - `/sitemap`
  - `/accessibility`

Current auth model:
- File: `src/context/AuthContext.tsx`
- Local storage key: `photorido_user`
- Roles:
  - `super-admin`
  - `vendor`
  - `user`
- Mock seeded credentials:
  - `superadmin@photorido.com` / `password`
  - `vendor@photorido.com` / `password`
  - `user@photorido.com` / `password`
- Current seeded vendor identity is aligned to the bookable vendor flow:
  - `vendor@photorido.com` logs in as `Emma Rodriguez`
- Unknown emails can still use the mock flow
- Google login is mocked

Current shared marketplace state:
- File: `src/context/MarketplaceContext.tsx`
- App wiring: `src/App.tsx`
- Shared mock state includes:
  - bookings
  - conversations
  - notifications
  - reviews
  - platform users
  - permissions
  - roles
  - categories
  - sub-categories
  - listings
- Shared state is persisted in `localStorage`
- User, vendor, and super-admin dashboard flows now read from this shared marketplace context instead of isolated local-only copies

Current important files to inspect first:
- `package.json`
- `src/App.tsx`
- `src/routes.tsx`
- `src/layouts/RootLayout.tsx`
- `src/context/AuthContext.tsx`
- `src/context/MarketplaceContext.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/PhotographerDetailsPage.tsx`
- `src/components/dashboards/DashboardSidebar.tsx`
- `src/components/dashboards/MarketplaceDashboardViews.tsx`
- `src/components/dashboards/SuperAdminDashboard.tsx`
- `src/components/dashboards/VendorDashboard.tsx`
- `src/components/dashboards/ConsumerDashboard.tsx`
- `src/components/dashboards/CreateListingPage.tsx`
- `src/components/SearchResults.tsx`
- `src/components/PhotographerDetails.tsx`
- `src/components/mobile/*`
- `src/DESIGN_SYSTEM.md`
- `src/AUTHENTICATION_SYSTEM.md`
- `src/MOBILE_APP.md`

Current booking lifecycle:
The booking system supports a shared frontend-only lifecycle across user and vendor flows.

Current booking status model:
- `pending`
- `approved_by_vendor`
- `rejected_by_vendor`
- `completed`
- `cancelled`

Lifecycle behavior currently implemented:
1. Booking creation
- Triggered from `src/pages/PhotographerDetailsPage.tsx`
- Creates a shared marketplace booking through `MarketplaceContext`
- Creates notifications for both user and vendor

2. Vendor decision
- Vendor can approve or reject in the vendor leads/bookings screen
- Approve -> `approved_by_vendor`
- Reject -> `rejected_by_vendor`
- Notifications are sent to both sides

3. Payment flow
- When booking status is `approved_by_vendor`, user can trigger `Make Payment`
- This sends a message into the shared messages module:
  - `Hey! I want to make a payment. My contact: {phoneNumber}`
- Vendor then gets a `Payment Received` action
- On confirmation, booking becomes `completed`

4. Withdrawal flow
- After completion, user can trigger `Withdraw Booking`
- This sends a message into the shared messages module:
  - `Hey! I want to cancel my booking. Contact: {phoneNumber}`
- Vendor then gets a `Confirm Withdrawal` action
- On confirmation, booking becomes `cancelled`

5. Retry flow
- If vendor rejects a booking, the user can use `Request Again`
- This moves the booking back to `pending` and resets request flags

6. Super-admin oversight
- Super-admin can view all bookings in the shared admin table
- Super-admin can update lifecycle status from the admin screen
- Admin status changes also create notifications for vendor and user

Current notification behavior:
- Notifications are stored in `MarketplaceContext`
- The dashboard bell icon opens a notification panel
- Notifications are role-scoped:
  - `user`
  - `vendor`
  - `super-admin`
- Notifications are persisted in `localStorage`
- Listing creation and listing moderation also trigger vendor + super-admin notifications

Current messaging behavior:
- Shared booking-triggered and manual messages are stored in marketplace conversations
- User and vendor message screens use shared lifecycle data
- Payment requests and withdrawal requests create messages in the conversation flow
- Message UI follows the existing dashboard interaction style

Current user dashboard behavior:
User left navigation includes:
- Dashboard
- Messages
- Bookings

Current user dashboard features:
1. Dashboard
- Shows booking metrics, unread message counts, spend summary, recent booking activity, and favorite professionals

2. Messages
- Shows shared user-vendor conversations
- Supports search, unread filtering, conversation list view, and chat thread view

3. Bookings
- Shows user bookings from shared marketplace state
- Supports:
  - payment request
  - request again
  - withdraw booking
- Reflects current lifecycle statuses and flags

Current vendor dashboard behavior:
Vendor left navigation includes:
- Dashboard
- Messages
- Leads
- Listings
- Schedulers
- Statistics

Current vendor features:
- Leads/bookings screen reads from shared marketplace state
- Vendor can:
  - approve
  - reject
  - confirm payment
  - confirm withdrawal
- Vendor messages use shared message state
- Vendor notifications show through the bell icon
- Vendor listings now read from shared marketplace listing state
- Vendor listing creation in `CreateListingPage` now creates shared pending listings for super-admin moderation

Current super-admin dashboard behavior:
Super-admin left navigation includes:
- Dashboard
- Vendor-User Bookings
- Reviews & Ratings
- User Management
- Permissions Creation
- Roles Creation
- Categories
- Sub-Categories
- Approve-Reject Listings
- Vendor Schedules

Current super-admin features already implemented:
1. Dashboard
- Richer platform overview with marketplace metrics
- Recent booking lifecycle visibility
- Listing moderation overview
- Role distribution and recent review visibility

2. Vendor-User Bookings
- Shows all bookings across the platform
- Shows lifecycle statuses
- Shows payment and withdrawal flags
- Supports admin-side status updates

3. Reviews & Ratings
- Shows user reviews and ratings given to vendors
- Includes date and time

4. User Management
- Shows all users with roles
- Supports filters for:
  - Super-Admin
  - Vendor
  - User
- Supports add, edit, and delete actions

5. Permission Creation
- Shows permissions
- Supports CRUD
- Supports role-based filtering

6. Role Creation
- Shows roles
- Supports CRUD
- Supports scope filtering
- Supports assigning permissions

7. Categories
- Shows categories
- Supports CRUD
- Supports status filters

8. Sub-Categories
- Shows sub-categories assigned to categories
- Supports CRUD
- Supports category-based filtering

9. Approve-Reject Listings
- Shows all vendor-created listings
- Supports approve and reject actions
- Sends notifications when vendor creates listing to:
  - vendor
  - super-admin
- Sends notifications after super-admin approves/rejects listing to:
  - vendor
  - super-admin

10. Vendor Schedules
- Still placeholder/basic compared to the rest
- Preserve current routing and treat this as pending enhancement work

Current responsive/layout state:
- Dashboard shells were updated to avoid global horizontal scrolling when the left navigation is collapsed
- Root layout now clamps horizontal overflow more safely
- Notification panel behavior was adjusted for smaller screens
- Search and photographer detail flows were improved for mobile/tablet layout behavior
- The app is more responsive than before, but it is still a prototype and should be treated as needing continued device-by-device QA as backend work approaches

Current design direction to preserve:
- marketplace-style product UI
- clean, modern, trustworthy styling
- blue-forward visual direction
- rounded cards and elevated surfaces
- consistent dashboard/sidebar behavior across roles
- responsive web behavior
- separate mobile preview support where relevant

Current project limitations:
- auth is mocked
- data is mostly mocked or locally defined
- booking, payment, withdrawal, notification, admin CRUD, and listing moderation flows are frontend-only prototype logic
- no real backend APIs
- no real payment integration
- no real vendor/user persistence beyond local storage
- admin user CRUD does not provision real auth accounts
- phone number used in payment/withdrawal message triggers is currently mocked
- some dense admin/vendor tables still rely on internal horizontal scrolling inside cards on smaller screens

Working rules for continuation:
1. Inspect the relevant files before editing.
2. Summarize the current implementation briefly before making changes.
3. Reuse existing patterns before creating new structures.
4. Preserve route structure, role separation, shared dashboard behavior, and shared marketplace lifecycle unless the task explicitly requires change.
5. Prefer small, safe, incremental edits over large rewrites.
6. Keep user, vendor, and super-admin flows aligned with their existing patterns.
7. Keep all lifecycle logic frontend-only unless explicitly asked to introduce real backend work.
8. Clearly mention assumptions and mock/backend gaps in your output.
9. When touching layouts, preserve the recent overflow/responsive fixes and avoid reintroducing global horizontal scrolling.

Output expectations for future tasks:
- explain what existing behavior was found
- explain what changed
- list changed files
- mention what was preserved
- mention assumptions
- mention any mocked or incomplete backend pieces still remaining

Continuation for further tasks:
Treat all follow-up prompts as continuation work on this exact current Photorido codebase. Build on top of the existing implementation, including the shared marketplace booking lifecycle, user and vendor message flows, notification center, payment request flow, withdrawal flow, shared listing moderation flow, and implemented super-admin management screens. Do not revert to the original Figma-export mindset. Prefer extending the current routes, shared dashboard system, mock auth model, shared marketplace context, and responsive shell/layout patterns rather than replacing them.
```

## Short Copy-Paste Version

```text
Continue work on the existing Photorido project from the current repo state, not from scratch. This is a React 18 + Vite + TypeScript photographer marketplace frontend prototype with public marketing pages, discovery flows, mock auth, role-based dashboards, and a separate mobile preview route. The app uses shared marketplace mock state in `src/context/MarketplaceContext.tsx` for bookings, conversations, notifications, reviews, platform users, permissions, roles, categories, sub-categories, and listings. Booking lifecycle, payment request messaging, withdrawal messaging, listing moderation, and bell notifications are already wired into the shared dashboard system. Super-admin management screens for dashboard, bookings, reviews, users, permissions, roles, categories, sub-categories, and listing approval are already implemented in mock form, while vendor schedules remain lighter. Reuse the existing routes, dashboard patterns, shared sidebar, mock auth behavior, shared marketplace context, and recent responsive/overflow fixes. Make incremental edits, preserve stable behavior, and clearly report changed files, assumptions, and remaining mocked/backend placeholder logic. Treat all future prompts as continuation work for further tasks.
```
