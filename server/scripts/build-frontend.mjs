// Builds the public site and the admin site into server/site/{public,admin},
// so this folder deploys on its own with everything it serves. Needs pnpm and
// the workspace deps (`pnpm install` at the repo root).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(serverRoot, "..");

const builds = [
  {
    name: "public",
    env: { VITE_APP_TITLE: "Northumberland Fitness", VITE_ROBOTS: "index, follow", VITE_ADMIN_SITE: "false" },
  },
  {
    name: "admin",
    env: { VITE_APP_TITLE: "Northumberland Fitness — Admin", VITE_ROBOTS: "noindex, nofollow", VITE_ADMIN_SITE: "true" },
  },
];

for (const { name, env } of builds) {
  console.log(`\n> Building ${name} site...`);
  const outDir = path.join(serverRoot, "site", name);
  const result = spawnSync(
    "pnpm",
    ["--filter", "@workspace/northumberland-fitness", "exec", "vite", "build", "--config", "vite.config.ts", "--outDir", `"${outDir}"`],
    {
      cwd: repoRoot,
      stdio: "inherit",
      shell: true,
      // VITE_API_URL is blank so the site calls the API on its own origin. This
      // overrides the frontend's .env, which still points the cPanel build at Render.
      env: { ...process.env, NODE_ENV: "production", PORT: "3000", BASE_PATH: "/", VITE_API_URL: "", ...env },
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);

  // Leftovers from the old cPanel deploy that Vite copies in from public/.
  for (const file of ["contact.php", ".htaccess"]) {
    fs.rmSync(path.join(outDir, file), { force: true });
  }
}
