import { Database } from "bun:sqlite";

const DB_PATH = "./keyShares.db";
const TABLE_NAME = "keyShares";
const COLUMN_EMAIL = "email";
const COLUMN_KEY_SHARE = "keyShare";

const db = Database.open(DB_PATH);

db.run(`
  CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    ${COLUMN_EMAIL} TEXT PRIMARY KEY,
    ${COLUMN_KEY_SHARE} TEXT
  )
`);

const getKeyShareInDB = (email: string): string | null => {
  try {
    const stmt = db.query(`SELECT ${COLUMN_KEY_SHARE} FROM ${TABLE_NAME} WHERE ${COLUMN_EMAIL} = ?`);
    const result = stmt.get(email) as { keyShare: string } | undefined;
    return result?.keyShare ?? null;
  } catch (error) {
    console.error(`[DB Error] Failed to get keyShare for email "${email}":`, error);
    return null;
  }
};

const setKeyShareInDB = (email: string, keyShare: string): boolean => {
  try {
    const stmt = db.query(`INSERT OR REPLACE INTO ${TABLE_NAME} (${COLUMN_EMAIL}, ${COLUMN_KEY_SHARE}) VALUES (?, ?)`);
    stmt.run(email, keyShare);
    return true;
  } catch (error) {
    console.error(`[DB Error] Failed to set keyShare for email "${email}":`, error);
    return false;
  }
};

export { getKeyShareInDB, setKeyShareInDB };
