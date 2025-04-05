import { open, Database } from "sqlite";
import sqlite3 from "sqlite3";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILENAME = "keyShares.db";
const DB_PATH = path.resolve(__dirname, DB_FILENAME);
const TABLE_NAME = "keyShares";
const COLUMN_EMAIL = "email";
const COLUMN_KEY_SHARE = "keyShare";

let dbPromise: Promise<Database> | null = null;

function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = initializeDatabase();
  }
  return dbPromise;
}

async function initializeDatabase(): Promise<Database> {
  try {
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    await db.exec(
      `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        ${COLUMN_EMAIL} TEXT PRIMARY KEY NOT NULL,
        ${COLUMN_KEY_SHARE} TEXT NOT NULL
      )`
    );

    console.log(`Database initialized successfully at ${DB_PATH}`);
    return db;
  } catch (error) {
    console.error("Fatal error during database initialization:", error);
    dbPromise = null;
    throw error;
  }
}

export async function getKeyShareInDB(email: string): Promise<string | null> {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email provided: Must be a non-empty string.");
  }

  try {
    const db = await getDb();
    const row = await db.get<{ [COLUMN_KEY_SHARE]: string }>(
      `SELECT ${COLUMN_KEY_SHARE} FROM ${TABLE_NAME} WHERE ${COLUMN_EMAIL} = ?`,
      [email]
    );
    return row?.[COLUMN_KEY_SHARE] ?? null;
  } catch (error) {
    throw error;
  }
}

export async function setKeyShareInDB(email: string, keyShare: string): Promise<void> {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email provided: Must be a non-empty string.");
  }
  if (!keyShare || typeof keyShare !== "string") {
    throw new Error("Invalid keyShare provided: Must be a non-empty string.");
  }

  try {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO ${TABLE_NAME} (${COLUMN_EMAIL}, ${COLUMN_KEY_SHARE}) VALUES (?, ?)
       ON CONFLICT(${COLUMN_EMAIL}) DO UPDATE SET ${COLUMN_KEY_SHARE} = excluded.${COLUMN_KEY_SHARE}`,
      [email, keyShare]
    );

    if (result.changes === 0) {
      console.warn(`No changes made when setting key share for email: ${email}. The value might have been the same.`);
    }
  } catch (error) {
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (!dbPromise) {
    return;
  }
  try {
    const db = await dbPromise;
    await db.close();
    dbPromise = null;
    console.log("Database connection closed successfully.");
  } catch (error) {
    console.error("Failed to close the database connection:", error);
    throw error;
  }
}
