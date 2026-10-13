import crypto from "node:crypto";
import { pool } from "../db.js";

const SEX_OPTIONS = ["male", "female", "other", "prefer_not_to_say"];
const AGE_RANGE_OPTIONS = ["under_18", "18_24", "25_34", "35_44", "45_54", "55_64", "65_plus"];
const MEMBERSHIP_OPTIONS = ["basic", "premium", "elite"];
const ROLE_OPTIONS = ["member", "admin"];

// IDs are 24 hex characters, the same shape as the MongoDB ObjectIds the
// existing accounts were imported with.
function newId() {
  return crypto.randomBytes(12).toString("hex");
}

// The API returns users with an `_id` field (as it did under MongoDB) and
// never sends the password hash.
function rowToUser(row) {
  if (!row) return null;
  const user = {
    _id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    membership: row.membership,
    sex: row.sex,
    ageRange: row.age_range,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  Object.defineProperty(user, "passwordHash", { value: row.password_hash, enumerable: false });
  return user;
}

export async function findUserById(id) {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [String(id)]);
  return rowToUser(rows[0]);
}

export async function findUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rowToUser(rows[0]);
}

export async function listUsers() {
  const [rows] = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  return rows.map(rowToUser);
}

// `id`, `createdAt` and `updatedAt` are only passed when importing existing accounts.
export async function createUser({ id, firstName, lastName, email, passwordHash, phone = "", membership = "basic", sex, ageRange = null, role = "member", createdAt, updatedAt }) {
  const now = new Date();
  const row = {
    id: id || newId(),
    first_name: String(firstName).trim(),
    last_name: String(lastName).trim(),
    email: String(email).toLowerCase().trim(),
    password_hash: passwordHash,
    phone: String(phone).trim(),
    membership,
    sex,
    age_range: ageRange,
    role,
    created_at: createdAt || now,
    updated_at: updatedAt || now,
  };
  await pool.query("INSERT INTO users SET ?", [row]);
  return rowToUser(row);
}

export async function setUserRole(id, role) {
  await pool.query("UPDATE users SET role = ?, updated_at = ? WHERE id = ?", [role, new Date(), String(id)]);
  return findUserById(id);
}

export { SEX_OPTIONS, AGE_RANGE_OPTIONS, MEMBERSHIP_OPTIONS, ROLE_OPTIONS };
