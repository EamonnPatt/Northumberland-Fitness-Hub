// One-off import of the old MongoDB data into MySQL.
//
//   node scripts/import-mongo-export.mjs mongo-export.json
//
// Reads the DB_* settings from server/.env. Accounts keep their IDs and
// password hashes, so existing logins keep working. Accounts whose email is
// already in MySQL are skipped, and site content is only imported if MySQL
// doesn't have any yet, so running it twice is harmless.
import "dotenv/config";
import fs from "node:fs";
import { connectDb, pool } from "../src/db.js";
import { findUserByEmail, createUser } from "../src/models/User.js";
import { saveSiteContent } from "../src/models/SiteContent.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/import-mongo-export.mjs <export.json>");
  process.exit(1);
}
const { users, content } = JSON.parse(fs.readFileSync(file, "utf8"));

await connectDb();

for (const user of users) {
  if (await findUserByEmail(user.email)) {
    console.log(`Skipped ${user.email} (already in MySQL).`);
    continue;
  }
  await createUser({ ...user, createdAt: new Date(user.createdAt), updatedAt: new Date(user.updatedAt) });
  console.log(`Imported ${user.email} (${user.role}).`);
}

if (content) {
  const [rows] = await pool.query("SELECT COUNT(*) AS n FROM site_content");
  if (rows[0].n > 0) {
    console.log("Skipped site content (already in MySQL).");
  } else {
    await saveSiteContent(content, {
      onlyIfMissing: true,
      createdAt: new Date(content.createdAt),
      updatedAt: new Date(content.updatedAt),
    });
    console.log("Imported site content.");
  }
}

await pool.end();
