import mysql from "mysql2/promise";

export let pool;

// Tables are created on startup if they don't exist, so a fresh cPanel
// database needs no manual setup.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id CHAR(24) NOT NULL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL DEFAULT '',
    membership VARCHAR(20) NOT NULL DEFAULT 'basic',
    sex VARCHAR(30) NOT NULL,
    age_range VARCHAR(20) NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL,
    UNIQUE KEY users_email (email),
    KEY users_created_at (created_at)
  ) DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS site_content (
    content_key VARCHAR(32) NOT NULL PRIMARY KEY,
    hero LONGTEXT NOT NULL,
    hours LONGTEXT NOT NULL,
    classes LONGTEXT NOT NULL,
    pricing LONGTEXT NOT NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL
  ) DEFAULT CHARSET=utf8mb4`,
  // Daily/weekly/monthly passes sold in person on the Square terminal. Dates
  // are stored as YYYY-MM-DD text (gym-local days, no timezone to get wrong).
  `CREATE TABLE IF NOT EXISTS provisional_memberships (
    id CHAR(24) NOT NULL PRIMARY KEY,
    member_key CHAR(4) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(255) NOT NULL DEFAULT '',
    plan VARCHAR(20) NOT NULL,
    price VARCHAR(20) NOT NULL DEFAULT '',
    start_date CHAR(10) NOT NULL,
    end_date CHAR(10) NOT NULL,
    notes TEXT NOT NULL,
    employee VARCHAR(100) NOT NULL DEFAULT '',
    confirmation VARCHAR(20) NOT NULL DEFAULT '',
    created_by VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME(3) NOT NULL,
    KEY provisional_key (member_key),
    KEY provisional_end_date (end_date),
    KEY provisional_created_at (created_at)
  ) DEFAULT CHARSET=utf8mb4`,
];

// CREATE TABLE IF NOT EXISTS leaves existing tables alone, so columns added
// after a table was first created are added here.
const ADDED_COLUMNS = [
  { table: "provisional_memberships", column: "employee", definition: "VARCHAR(100) NOT NULL DEFAULT '' AFTER notes" },
  { table: "provisional_memberships", column: "confirmation", definition: "VARCHAR(20) NOT NULL DEFAULT '' AFTER employee" },
];

async function addMissingColumns() {
  for (const { table, column, definition } of ADDED_COLUMNS) {
    const [rows] = await pool.query(
      "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
      [table, column],
    );
    if (rows.length === 0) await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export async function connectDb() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_USER || !DB_NAME) {
    throw new Error("DB_USER and DB_NAME environment variables are required but were not provided.");
  }
  pool = mysql.createPool({
    host: DB_HOST || "localhost",
    port: Number(DB_PORT) || 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    charset: "utf8mb4",
    // Store and read DATETIMEs as UTC regardless of the server's timezone.
    timezone: "Z",
    connectionLimit: 5,
  });
  for (const statement of SCHEMA) {
    await pool.query(statement);
  }
  await addMissingColumns();
  console.log("Connected to MySQL");
}
