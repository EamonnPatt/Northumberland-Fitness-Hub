import { pool } from "../db.js";

const CONTENT_KEY = "site";

// Fields each section's items keep; required ones must be non-empty strings.
const SECTIONS = {
  hero: { title: true, subtitle: false, image: true },
  hours: { day: true, hours: true },
  classes: { name: true, day: true, time: true, instructor: false },
  pricing: { id: true, name: true, price: true, description: false },
};

export class ContentValidationError extends Error {
  status = 422;
}

// Keeps only the known string fields of each item, like the old Mongoose schemas.
function cleanSection(name, items) {
  if (!Array.isArray(items)) {
    throw new ContentValidationError(`${name} must be a list.`);
  }
  return items.map((item, index) => {
    const clean = {};
    for (const [field, required] of Object.entries(SECTIONS[name])) {
      const value = item?.[field];
      if (required && (typeof value !== "string" || value === "")) {
        throw new ContentValidationError(`${name} item ${index + 1} is missing ${field}.`);
      }
      clean[field] = value == null ? "" : String(value);
    }
    return clean;
  });
}

function rowToContent(row) {
  return {
    key: row.content_key,
    hero: JSON.parse(row.hero),
    hours: JSON.parse(row.hours),
    classes: JSON.parse(row.classes),
    pricing: JSON.parse(row.pricing),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const DEFAULT_CONTENT = {
  hero: [
    {
      title: "Feel Better. Move Better.\nLive Stronger",
      subtitle: "Premium Equipment. Safe Environment. Supportive Community",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Progress Starts The Moment You Show Up",
      subtitle: "Your Journey. Your Pace. Your Progress.",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Push Past Limits.\nBuild What Lasts.",
      subtitle: "Every Repetition Builds the Future you Want",
      image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop",
    },
  ],
  hours: [
    { day: "Monday", hours: "5:00 AM — 10:00 PM" },
    { day: "Tuesday", hours: "5:00 AM — 10:00 PM" },
    { day: "Wednesday", hours: "5:00 AM — 10:00 PM" },
    { day: "Thursday", hours: "5:00 AM — 10:00 PM" },
    { day: "Friday", hours: "5:00 AM — 10:00 PM" },
    { day: "Saturday", hours: "5:00 AM — 10:00 PM" },
    { day: "Sunday", hours: "5:00 AM — 10:00 PM" },
  ],
  classes: [
    { name: "HIIT Blast", day: "Monday", time: "6:00 PM", instructor: "TBD" },
    { name: "Spin", day: "Wednesday", time: "7:00 AM", instructor: "TBD" },
    { name: "Mobility & Core", day: "Friday", time: "5:30 PM", instructor: "TBD" },
  ],
  pricing: [
    { id: "basic", name: "Basic", price: "$29/mo", description: "Access to gym floor" },
    { id: "premium", name: "Premium", price: "$49/mo", description: "Gym floor & classes" },
    { id: "elite", name: "Elite", price: "$79/mo", description: "All access + personal training" },
  ],
};

export async function getOrCreateSiteContent() {
  const [rows] = await pool.query("SELECT * FROM site_content WHERE content_key = ?", [CONTENT_KEY]);
  if (rows[0]) return rowToContent(rows[0]);
  await saveSiteContent(DEFAULT_CONTENT, { onlyIfMissing: true });
  return getOrCreateSiteContent();
}

// Replaces the given sections (hero, hours, classes, pricing); sections left
// out keep their current value. `createdAt`/`updatedAt` are only passed when
// importing existing content.
export async function saveSiteContent(sections, { onlyIfMissing = false, createdAt, updatedAt } = {}) {
  const now = new Date();
  const values = {};
  for (const name of Object.keys(SECTIONS)) {
    if (sections[name] !== undefined) values[name] = JSON.stringify(cleanSection(name, sections[name]));
  }
  if (onlyIfMissing) {
    const row = {
      content_key: CONTENT_KEY,
      ...Object.fromEntries(Object.keys(SECTIONS).map((name) => [name, "[]"])),
      ...values,
      created_at: createdAt || now,
      updated_at: updatedAt || now,
    };
    await pool.query("INSERT IGNORE INTO site_content SET ?", [row]);
    return;
  }
  await getOrCreateSiteContent();
  await pool.query("UPDATE site_content SET ? WHERE content_key = ?", [{ ...values, updated_at: updatedAt || now }, CONTENT_KEY]);
}
