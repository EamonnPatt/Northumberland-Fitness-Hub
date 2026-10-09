# Northumberland Fitness

One Node app that serves everything:

- the public site — `northumberlandfitness.com`
- the admin site — `admin.northumberlandfitness.com` (any hostname starting with `admin.`)
- the API under `/api`, on both hostnames

The site and API share an origin, so the frontend needs no API URL and there
is no separate static host or `contact.php` any more.

## API

- `/api/auth/register`, `/api/auth/login`, `/api/auth/me`: member accounts (JWT-based)
- `/api/content`: the editable site content (hours, homepage hero text, class timetable, pricing). Public `GET`, admin-only `PUT`.
- `/api/admin/users`: list members and change roles (admin-only)
- `/api/contact`: the Contact / Join The Club forms, emailed over SMTP (replaces `contact.php`)

One admin account is created automatically from `ADMIN_EMAIL` /
`ADMIN_PASSWORD` on first startup. From the admin panel that account can
promote other members to admin.

## Environment variables

| Variable | |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | long random string (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | the manager's login for the admin panel |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | mailbox the contact form sends through, e.g. the cPanel account `contact@northumberlandfitness.com` on `mail.northumberlandfitness.com`, port `465` |
| `SMTP_SECURE` | optional; defaults to `true` on port 465, `false` otherwise |
| `MAIL_FROM` | optional; defaults to `SMTP_USER` |
| `CONTACT_TO` | optional; defaults to `contact@northumberlandfitness.com` |
| `CLIENT_ORIGIN` | optional; extra origins (comma-separated) allowed to call the API cross-origin. Not needed for the site itself. |
| `PORT` | optional; defaults to 4000 (most hosts set this for you) |

## Building the frontend

The server serves the prebuilt bundles in `site/public` and `site/admin`
(inside this folder), which are committed, so the host never builds the
frontend. After changing anything in `artifacts/northumberland-fitness/src`,
rebuild both and commit the result:

```
pnpm install          # once, at the repo root
cd server
npm run build:frontend
```

## Deploy

Deploy **this `server` folder only**. It is self-contained, so don't deploy
the repo root (a pnpm monorepo with no start script) or the Vite app folder
(frontend source only). On any Node host:

1. App root / root directory: `server`
2. Install: `npm install`
3. Start: `npm start` (listens on `process.env.PORT`)
4. Set the environment variables above.
5. Point both `northumberlandfitness.com` and `admin.northumberlandfitness.com` at the app.

**cPanel → Setup Node.js App:** set the application root to the repo's
`server` folder and the startup file to `app.cjs`. Add the environment
variables in that screen, click *Run NPM Install*, then restart. Map the
admin subdomain to the same app.

**Render:** use a Web Service with root directory `server`, build command
`npm install` and start command `npm start`. Add both domains under
*Custom Domains*.

## Local development

```
cd server
npm install
npm run dev
```

Open <http://localhost:4000> for the public site and
<http://admin.localhost:4000> for the admin site.
