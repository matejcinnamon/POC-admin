# Utility Bills Admin Dashboard

Separate admin dashboard for the Utility Bills app.

## Features

- Admin login with role check
- Overview stats (users, invoices, total amount, invoice statuses)
- User management (list users, grant/revoke admin role)
- Invoice explorer (view all invoices across users)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure the backend is running and its `FRONTEND_URL` includes `http://localhost:3001`.

3. Promote an existing user to admin (run from the backend folder):
   ```bash
   npm run make-admin -- admin@example.com
   ```

4. Start the admin dashboard:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3001` and log in with the admin account.

## Environment variables

Create a `.env.local` file if needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```
