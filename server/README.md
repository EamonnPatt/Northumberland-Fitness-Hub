a# Northumberland Fitness API

Express + MongoDB backend for member accounts, login, and the admin content
panel. This is a separate Node app from the static site — it does **not**
run on the cPanel hosting the site currently uses. Deploy it to any Node
host (Render and Railway both have free tiers and work well here).

## What it does

- `/api/auth/register`, `/api/auth/login`, `/api/auth/me` — member accounts (JWT-based)
- `/api/content` — the editable site content (hours, homepage hero text, class timetable, pricing). Public `GET`, admin-only `PUT`.
- `/api/admin/users` — list members and change roles (admin-only)

One admin account is bootstrapped automatically from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` on first startup. From the admin panel that account can
promote other members to admin, so more than one person can manage content.

## Deploy (Render, free tier)

1. Push this repo to GitHub if it isn't already.
2. On [render.com](https://render.com): New → Web Service → connect the repo.
3. Set **Root Directory** to `server`.
4. Build command: `npm install`. Start command: `npm start`.
5. Add environment variables (Render → Environment):
   - `MONGODB_URI` — your MongoDB connection string
   - `JWT_SECRET` — a long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `CLIENT_ORIGIN` — your site's origin(s), comma-separated, e.g. `https://northumberlandfitness.com`
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the manager's login for the admin panel
6. Deploy. Render gives you a URL like `https://northumberland-fitness-api.onrender.com`.

Any other Node host (Railway, Fly.io, a VPS) works the same way — install
deps, set the same env vars, run `npm start`.

## Wire up the frontend

In `artifacts/northumberland-fitness/.env` (create it, copy from
`.env.example`):

```
VITE_API_URL=https://northumberland-fitness-api.onrender.com
```

Then rebuild and redeploy the static site as before:

```
pnpm --filter @workspace/northumberland-fitness run build
```

Copy the contents of `artifacts/northumberland-fitness/dist/public/` to the
repo root (same as the current cPanel deployment process) and upload.

## Local development

```
cd server
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, etc.
npm install
npm run dev
```

The API listens on `PORT` (default 4000). Point the frontend's
`VITE_API_URL` at `http://localhost:4000` while developing.
