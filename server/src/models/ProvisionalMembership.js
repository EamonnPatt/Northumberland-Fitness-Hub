import crypto from "node:crypto";
import { pool } from "../db.js";

export const PLAN_OPTIONS = ["daily", "weekly", "monthly"];

export class ProvisionalValidationError extends Error {
  status = 422;
}

// Days are the gym's local calendar days, not UTC.
const GYM_TIME_ZONE = "America/Toronto";

export function todayString() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: GYM_TIME_ZONE }).format(new Date());
}

function isDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

// A pass covers its start day and runs for one day, seven days, or one calendar
// month (so a monthly pass bought on the 15th ends on the 14th), inclusive.
export function endDateFor(plan, startDate) {
  const [y, m, d] = startDate.split("-").map(Number);
  const end = new Date(Date.UTC(y, m - 1, d));
  if (plan === "weekly") {
    end.setUTCDate(end.getUTCDate() + 6);
  } else if (plan === "monthly") {
    end.setUTCMonth(end.getUTCMonth() + 1);
    // 31 Jan + 1 month overflows into March; fall back to the last day of February.
    if (end.getUTCDate() !== d) end.setUTCDate(0);
    else end.setUTCDate(end.getUTCDate() - 1);
  }
  return end.toISOString().slice(0, 10);
}

function statusFor(row, today) {
  if (row.start_date > today) return "upcoming";
  return row.end_date >= today ? "active" : "expired";
}

function rowToMembership(row, today) {
  return {
    _id: row.id,
    key: row.member_key,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    plan: row.plan,
    price: row.price,
    startDate: row.start_date,
    endDate: row.end_date,
    notes: row.notes,
    employee: row.employee,
    // "sent", "failed" or "skipped" (blank for passes entered before confirmations existed).
    confirmation: row.confirmation || "",
    createdBy: row.created_by,
    createdAt: row.created_at,
    status: statusFor(row, today),
  };
}

// A four-digit key identifies a pass at the front desk, so it only has to be
// unique among passes that haven't ended yet; expired keys are reused.
async function generateKey(today) {
  const [rows] = await pool.query("SELECT member_key FROM provisional_memberships WHERE end_date >= ?", [today]);
  const inUse = new Set(rows.map((row) => row.member_key));
  if (inUse.size >= 10000) throw new Error("All four-digit keys are in use.");
  for (;;) {
    const key = String(crypto.randomInt(0, 10000)).padStart(4, "0");
    if (!inUse.has(key)) return key;
  }
}

const trimmed = (value) => (value == null ? "" : String(value).trim());

export async function createProvisionalMembership(input, createdBy) {
  const firstName = trimmed(input.firstName);
  const lastName = trimmed(input.lastName);
  if (!firstName || !lastName) throw new ProvisionalValidationError("First and last name are required.");
  const employee = trimmed(input.employee);
  if (!employee) throw new ProvisionalValidationError("Enter the employee who handled the transaction.");
  if (employee.length > 100) throw new ProvisionalValidationError("Employee name is too long.");
  if (!PLAN_OPTIONS.includes(input.plan)) throw new ProvisionalValidationError("Choose daily, weekly or monthly.");
  const today = todayString();
  const startDate = input.startDate ? trimmed(input.startDate) : today;
  if (!isDateString(startDate)) throw new ProvisionalValidationError("Start date must be a valid date.");
  const phone = trimmed(input.phone);
  const email = trimmed(input.email).toLowerCase();
  if (!phone && !email) throw new ProvisionalValidationError("Enter a phone number or an email address.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ProvisionalValidationError("Enter a valid email address.");
  if (phone && phone.replace(/\D/g, "").length < 7) throw new ProvisionalValidationError("Enter a valid phone number.");
  const price = trimmed(input.price).replace(/^\$/, "");
  if (price && !/^\d{1,4}(\.\d{1,2})?$/.test(price)) throw new ProvisionalValidationError("Price must be a dollar amount like 40.00.");

  const row = {
    id: crypto.randomBytes(12).toString("hex"),
    member_key: await generateKey(today),
    first_name: firstName,
    last_name: lastName,
    phone,
    email,
    plan: input.plan,
    price,
    start_date: startDate,
    end_date: endDateFor(input.plan, startDate),
    notes: trimmed(input.notes),
    employee,
    created_by: createdBy || "",
    created_at: new Date(),
  };
  await pool.query("INSERT INTO provisional_memberships SET ?", [row]);
  return rowToMembership(row, today);
}

// `query` is a four-digit key (exact match) or part of a name, phone number or
// email. Newest first, capped so the page stays quick.
export async function listProvisionalMemberships({ query = "", status = "" } = {}) {
  const today = todayString();
  const where = [];
  const params = [];
  const q = trimmed(query);
  if (/^\d{4}$/.test(q)) {
    where.push("member_key = ?");
    params.push(q);
  } else if (q) {
    const like = `%${q.replace(/[\%_]/g, "\$&")}%`;
    where.push("(CONCAT(first_name, ' ', last_name) LIKE ? OR phone LIKE ? OR email LIKE ? OR employee LIKE ?)");
    params.push(like, like, like, like);
  }
  if (status === "active") {
    where.push("start_date <= ? AND end_date >= ?");
    params.push(today, today);
  } else if (status === "expired") {
    where.push("end_date < ?");
    params.push(today);
  }
  const sql = `SELECT * FROM provisional_memberships${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC LIMIT 200`;
  const [rows] = await pool.query(sql, params);
  return rows.map((row) => rowToMembership(row, today));
}

export async function findProvisionalMembership(id) {
  const [rows] = await pool.query("SELECT * FROM provisional_memberships WHERE id = ?", [String(id)]);
  return rows[0] ? rowToMembership(rows[0], todayString()) : null;
}

export async function setConfirmationStatus(id, status) {
  await pool.query("UPDATE provisional_memberships SET confirmation = ? WHERE id = ?", [status, String(id)]);
}

export async function deleteProvisionalMembership(id) {
  const [result] = await pool.query("DELETE FROM provisional_memberships WHERE id = ?", [String(id)]);
  return result.affectedRows > 0;
}
