# Utility Bills Admin Dashboard

Separate Next.js admin dashboard for the Utility Bills platform. Requires `isAdmin: true` on the backend user account.

## Features

- **Admin Login**: Cookie-based login with `isAdmin` check — non-admins are rejected
- **Overview Stats**: Total users, invoices, total invoice amount, status breakdown
- **User Management**: Paginated user list, grant/revoke admin role
- **User Detail**: Per-user invoices, Gmail activity, extraction metrics
- **Invoice Explorer**: All invoices across all users (paginated)
- **Superadmin Protection**: "Revoke admin" button hidden for the superadmin account; revocation also blocked server-side

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- TailwindCSS 4
- Axios (API client with token interceptors)
- js-cookie (token storage)

## Project Structure

```
app/
├── components/
│   └── AdminNav.tsx          # Navigation bar
├── invoices/
│   └── page.tsx              # All invoices across users
├── lib/
│   └── api.ts                # Axios client + all admin API functions
├── users/
│   ├── page.tsx              # User list with admin toggle
│   └── [id]/
│       └── page.tsx          # User detail (invoices / activity / metrics tabs)
├── layout.tsx                # Root layout
└── page.tsx                  # Dashboard overview (stats)
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure the backend is running and `FRONTEND_URL` in the backend `.env` includes `http://localhost:3001`.

3. A superadmin account is created automatically on backend startup from `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` (see backend `.env.example`). Its admin role cannot be revoked.

4. Start the admin dashboard:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3001` and log in with an admin account.

## Environment Variables

Create `.env.local` in the `admin/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SUPERADMIN_EMAIL=cinnamon.development@cinnamon.agency
```

`NEXT_PUBLIC_SUPERADMIN_EMAIL` is optional — the UI falls back to the default superadmin email if not set.

## API Endpoints Used

**Auth (shared with web):**
- `POST /api/auth/login` — Login (must have `isAdmin: true`)
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Verify session on page load

**Admin:**
- `GET /api/admin/stats` — Platform stats
- `GET /api/admin/users` — Paginated user list
- `GET /api/admin/users/:id/invoices` — Invoices for a specific user
- `GET /api/admin/users/:id/activity` — Gmail processing activity for a user
- `GET /api/admin/users/:id/metrics` — Extraction metrics for a user
- `PATCH /api/admin/users/:id/admin` — Grant or revoke admin role
- `GET /api/admin/invoices` — All invoices (paginated)

## Build

```bash
npm run build
npm start
```
