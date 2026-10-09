import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import { ensureAdmin } from "./seed/ensureAdmin.js";
import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import adminRoutes from "./routes/admin.js";
import contactRoutes from "./routes/contact.js";

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// The site and admin bundles are built into server/site by
// `npm run build:frontend` and committed, so this folder deploys on its own.
const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../site");
const sites = {
  public: path.join(siteDir, "public"),
  admin: path.join(siteDir, "admin"),
};

// admin.northumberlandfitness.com (or admin.localhost while developing) gets
// the admin bundle; every other hostname gets the public site.
function siteFor(req) {
  return req.hostname.startsWith("admin.") ? "admin" : "public";
}

const app = express();
app.set("trust proxy", 1);
app.use(
  "/api",
  cors((req, callback) => {
    const origin = req.headers.origin;
    // The site and API now share an origin, so same-host requests (which
    // still send an Origin header on POST) are always allowed, as are
    // non-browser requests and any extra origin listed in CLIENT_ORIGIN.
    let sameHost = false;
    try {
      sameHost = Boolean(origin) && new URL(origin).host === req.headers.host;
    } catch {
      // Malformed Origin header — treat as cross-origin.
    }
    if (!origin || sameHost || allowedOrigins.includes(origin)) {
      callback(null, { origin: true });
    } else {
      callback(null, { origin: false });
    }
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api", (_req, res) => res.status(404).json({ ok: false, message: "Not found." }));
// The frontend posts its forms to /contact.php (the old cPanel handler), so
// the same frontend build works on both the static cPanel site and here.
app.use("/contact.php", contactRoutes);

const staticOptions = {
  index: false,
  setHeaders(res, filePath) {
    // Vite fingerprints everything in /assets, so it can be cached forever.
    if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  },
};
const staticHandlers = {
  public: express.static(sites.public, staticOptions),
  admin: express.static(sites.admin, staticOptions),
};

app.use((req, res, next) => {
  // Leftover cPanel files from the old static deploy — never serve these.
  if (/\.(php|htaccess)$/i.test(req.path)) return next();
  staticHandlers[siteFor(req)](req, res, next);
});

// Single-page app fallback: any other page route loads index.html and the
// client-side router takes it from there. Missing files still 404.
app.get("*", (req, res, next) => {
  if (path.extname(req.path)) return next();
  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(path.join(sites[siteFor(req)], "index.html"));
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, message: err.message || "Something went wrong." });
});

const port = Number(process.env.PORT) || 4000;

connectDb()
  .then(() => ensureAdmin())
  .then(() => {
    app.listen(port, () => console.log(`Northumberland Fitness listening on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
