import { Database, Statement } from "bun:sqlite";

const DB_PATH = "./keyShares.db";
const TABLE_NAME = "keyShares";
const COLUMN_EMAIL = "email";
const COLUMN_KEY_SHARE = "keyShare";

let db: Database;
try {
  db = new Database(DB_PATH);
  db.run(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      ${COLUMN_EMAIL} TEXT PRIMARY KEY NOT NULL,
      ${COLUMN_KEY_SHARE} TEXT NOT NULL
    )
  `);
} catch (error) {
  process.exit(1);
}

let getStmt: Statement | null = null;
let setStmt: Statement | null = null;

function prepareStatements() {
  if (!getStmt) {
    getStmt = db.query(`SELECT ${COLUMN_KEY_SHARE} FROM ${TABLE_NAME} WHERE ${COLUMN_EMAIL} = ?`);
  }
  if (!setStmt) {
    setStmt = db.query(
      `INSERT INTO ${TABLE_NAME} (${COLUMN_EMAIL}, ${COLUMN_KEY_SHARE}) VALUES (?, ?)
          ON CONFLICT(${COLUMN_EMAIL}) DO UPDATE SET ${COLUMN_KEY_SHARE} = excluded.${COLUMN_KEY_SHARE}`
    );
  }
}

prepareStatements();

export async function getKeyShareInDB(email: string): Promise<string | null> {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email provided: Must be a non-empty string.");
  }

  try {
    prepareStatements();
    const result = getStmt!.get(email) as { [COLUMN_KEY_SHARE]: string } | undefined | null;
    return result?.[COLUMN_KEY_SHARE] ?? null;
  } catch (error) {
    console.error(`[DB Error] Failed to get keyShare for email "${email}":`, error);
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
    prepareStatements();
    const result = setStmt!.run(email, keyShare);
    if (result.changes === 0) {
      console.warn(`No changes made when setting key share for email: ${email}. The value might have been the same.`);
    }
  } catch (error) {
    console.error(`[DB Error] Failed to set keyShare for email "${email}":`, error);
    throw error;
  }
}
