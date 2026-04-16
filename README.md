# All Stars Arena - Developer README

A Next.js + TypeScript web application for court reservations, buffet bookings, tournaments, and guest registration.

This document explains the project structure, setup, and where to find important code areas for contributors.

---

## Quick Links (files & components)
- App entry & pages:
  - Home: [`pages/index.tsx`](pages/index.tsx) — symbol: [`Rules`](pages/index.tsx)
  - Booking (practice court): [`pages/booking/Reserve/[id].tsx`](pages/booking/Reserve/[id].tsx)
  - Buffet:
    - Booking page: [`pages/booking/buffet/index.tsx`](pages/booking/buffet/index.tsx)
    - Buffet info: [`pages/booking/buffet/info.tsx`](pages/booking/buffet/info.tsx)
    - Queue UI: [`pages/booking/buffet/queue/index.tsx`](pages/booking/buffet/queue/index.tsx)
    - Admin buffet queue: [`pages/admin/backend/booking/buffet/index.tsx`](pages/admin/backend/booking/buffet/index.tsx) — component: [`Buffets`](pages/admin/backend/booking/buffet/index.tsx)
- Admin UI:
  - Admin home: [`pages/admin/backend/index.tsx`](pages/admin/backend/index.tsx)
  - Tournament: [`pages/admin/backend/tournament/`](pages/admin/backend/tournament/)
  - Daily summary: [`pages/admin/backend/dailySummary/index.tsx`](pages/admin/backend/dailySummary/index.tsx)
- Shared components & layout:
  - User sidebar: [`components/Sidebar.tsx`](components/Sidebar.tsx) — component: [`Sidebar`](components/Sidebar.tsx)
  - Admin sidebar: [`components/AdminSidebar.tsx`](components/AdminSidebar.tsx) — component: [`AdminSidebar`](components/AdminSidebar.tsx)
  - Layouts: [`components/Layout.tsx`](components/Layout.tsx), [`components/AdminLayout.tsx`](components/AdminLayout.tsx)
  - Shuttle control: [`pages/admin/backend/booking/buffet/ShuttleCockControl.tsx`](pages/admin/backend/booking/buffet/ShuttleCockControl.tsx) — component: [`ShuttleCockControl`](pages/admin/backend/booking/buffet/ShuttleCockControl.tsx)
  - Abbreviated select: [`components/admin/AbbreviatedSelect.tsx`](components/admin/AbbreviatedSelect.tsx)
- API endpoints:
  - Example: Admin setting (protected): [`pages/api/admin/setting/hand_level.ts`](pages/api/admin/setting/hand_level.ts)
  - Buffet APIs: get/regis/getone: [`pages/api/buffet/get.ts`](pages/api/buffet/get.ts), [`pages/api/buffet/getone.ts`](pages/api/buffet/getone.ts), [`pages/api/buffet/getRegis.ts`](pages/api/buffet/getRegis.ts)
  - Guest registration: [`pages/api/guest-register/index.ts`](pages/api/guest-register/index.ts)
  - Edit rules (protected): [`pages/api/admin/editRules/index.ts`](pages/api/admin/editRules/index.ts)
  - Add/reduce shuttlecock usage: [`pages/api/admin/buffet/add_reduce/index.ts`](pages/api/admin/buffet/add_reduce/index.ts)
- Database pool: [`db/db.ts`](db/db.ts) — MySQL connection pool used throughout the API (via `mysql2`)
- Styles:
  - CSS module examples: [`pages/guest-register/guest-register.module.css`](pages/guest-register/guest-register.module.css), [`styles/admin/buffet.module.css`](styles/admin/buffet.module.css)
- Environment & config:
  - [`package.json`](package.json) (scripts, dependencies)
  - `.env` (project env variables, not committed)
  - [`next.config.js`](next.config.js)
- Docker:
  - [`Dockerfile`](Dockerfile)

---

## Stack
- Next.js + TypeScript
- React + React Hooks
- MySQL (via `mysql2`)
- next-auth for token-based API access (use of `getToken` in API)
- Chakra UI (`@chakra-ui/react`) for some UI elements
- React Bootstrap for modal and table UI
- Cloudinary for image handling
- react-beautiful-dnd for drag & drop UI
- SweetAlert2 for user prompts
- ESLint and TypeScript for linting / typing

---

## Getting started (local development)

Prerequisites:
- Node >= 22.x (see `package.json` "engines")
- MySQL database

Quick start:
1. Clone repo and cd into project root.
2. Install dependencies:
   - npm: `npm install`
3. Add environment variables in `.env` (see file or example variables):
   - DB connection: host, user, password, database
   - CLOUDINARY_URL/API, JWT_SECRET (NextAuth), NEXT_PUBLIC_* as needed
4. Run in development:
   - `npm run dev`
   - Open http://localhost:3000

Build & start:
- Build: `npm run build`
- Start: `npm run start`

Notes:
- There is also a `server` script (`npm run server`) that runs `node server` (confirm intention / file).

---

## Project structure (high level)
- pages/ — Routes and API handlers:
  - `pages/api/*` — API endpoints (use `getToken` in protected endpoints)
  - `pages/booking/*` — Public booking UI for courts and buffet bookings
  - `pages/admin/backend/*` — Admin UIs (booking, settings, tournaments)
  - `pages/guest-register/*` — Guest registration UI and API
- components/ — Reusable UI components & layout
- db/ — MySQL pool and database utilities (e.g., `db/db.ts`)
- enum/ — Reusable enums (e.g., `buffetStatusEnum`, `paymentStatusEnum`)
- styles/ — CSS Modules style files

---

## How to add API routes & pages
- API: add files under `pages/api` and export default handler with `NextApiRequest`/`NextApiResponse`. Use `getToken` for protected routes:
  - Example: [`pages/api/admin/setting/hand_level.ts`](pages/api/admin/setting/hand_level.ts)
- Pages: add React components under `pages/`. Use server-side or client-side code as required. For server-side requests, use `getServerSideProps` or `getInitialProps`.

---

## Authentication & Authorization
- Admin API endpoints check JWT via `getToken` from `next-auth/jwt`:
  - See [`pages/api/admin/setting/hand_level.ts`](pages/api/admin/setting/hand_level.ts) and [`pages/api/admin/editRules/index.ts`](pages/api/admin/editRules/index.ts) for examples of checks.
- Ensure you maintain token validation in other admin-only APIs.

---

## Database & data handling tips
- Database pool is in [`db/db.ts`](db/db.ts)
- Many API endpoints use prepared SQL and MySQL parameterization.
- Some responses store JSON in DB columns (e.g., `shuttlecock_details`) — ensure you JSON.parse safely:
  - Example handling: [`pages/api/buffet/getone.ts`](pages/api/buffet/getone.ts) (parsing string to JSON)

---

## UI & Behavior notes
- Drag and drop: buffet queue & drag logic implemented using `react-beautiful-dnd`:
  - Admin queue: [`pages/admin/backend/booking/buffet/index.tsx`](pages/admin/backend/booking/buffet/index.tsx) — `Buffets()` component
- Buffet queue: [`pages/booking/buffet/queue/index.tsx`](pages/booking/buffet/queue/index.tsx)
- SweetAlert2 is used for confirmations and loading prompts across multiple pages:
  - Example: [`pages/booking/buffet/index.tsx`](pages/booking/buffet/index.tsx)
- File uploads and images:
  - Upload UI & preview in: [`pages/booking/buffet/info.tsx`](pages/booking/buffet/info.tsx)
  - Cloudinary + server side upload logic appears in APIs; search for `cloudinary` usage.

---

## Common tasks & examples
- Fetch shuttlecock types:
  - Called from UI: `getShuttleCockTypes` in [`pages/booking/buffet/index.tsx`](pages/booking/buffet/index.tsx)
  - Endpoint: `/api/buffet/get_shuttlecock_types`
- Update counts (debounced) in the admin UI:
  - Pattern using `debounce` and `fetch` in [`pages/admin/backend/booking/buffet/index.tsx`](pages/admin/backend/booking/buffet/index.tsx)

---

## Coding style / conventions
- TypeScript + React Functional components
- CSS Modules used for page styles (e.g., [`pages/guest-register/guest-register.module.css`](pages/guest-register/guest-register.module.css))
- Use `async/await` patterns for API and DB calls
- For UI/UX consistency, use SweetAlert2 prompts in user flows
- Use `getToken` checks for admin API routes.

---

## Tests & linting
- ESLint is included (see `package.json`).
- No test framework detected. Recommend adding Jest + React Testing Library for component and API tests.

---

## Docker & Deployment
- Dockerfile present. Project can be built and deployed to Vercel/ Docker-based environments.
- For Vercel deploys, the Next.js production build should be used.

---

## Troubleshooting & tips
- Node version mismatch — `package.json` requires Node 22.x.
- DB connection errors likely due to `.env` misconfiguration — check `db/db.ts`.
- File upload and Cloudinary: ensure credentials in `.env` and correct form data.
- If `shuttlecock_details` show as a string, ensure it’s JSON parsed safely (see [`pages/api/buffet/getone.ts`](pages/api/buffet/getone.ts)).

---

## Suggested improvements & next steps
- Add tests for API routes & UI components.
- Add central API client utility to avoid repeated `fetch` patterns.
- Extract repeated forms and modals into reusable components.
- Improve types and shared interfaces under `interface/`.
- Add CI for linting and tests.

---

## How to contribute
1. Fork and branch from `main`.
2. Run `npm run dev` and build locally, ensure database and `.env` set.
3. Follow existing patterns for naming, API routes, and token checks.
4. Ensure code has appropriate TypeScript types and pass ESLint.
5. Submit PR with brief description and testing steps.

---

If you need extended details on any part of the app (a certain page, API endpoint, or DB table), see the files and symbols linked above — e.g., start with main page [`pages/index.tsx`](pages/index.tsx), the API examples in [`pages/api/admin/setting/hand_level.ts`](pages/api/admin/setting/hand_level.ts), and buffet flows under [`pages/booking/buffet`](pages/booking/buffet).
