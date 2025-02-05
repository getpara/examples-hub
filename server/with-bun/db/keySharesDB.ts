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

/**
 * Fetches the keyShare associated with the given email.
 *
 * @param {string} email - The email to search for in the database.
 * @returns {string | null} - The keyShare if found, otherwise null.
 */
const getKeyShareInDB = (email: string): string | null => {
  try {
    const stmt = db.query(`SELECT ${COLUMN_KEY_SHARE} FROM ${TABLE_NAME} WHERE ${COLUMN_EMAIL} = ?`);
    const result = stmt.get(email) as { keyShare: string } | undefined;
    return result?.keyShare || null;
  } catch (error) {
    console.error(`Failed to get keyShare for email: ${email}`, error);
    return null;
  }
};

/**
 * Sets or updates the keyShare associated with the given email.
 *
 * @param {string} email - The email for which the keyShare should be set.
 * @param {string} keyShare - The keyShare string to store in the database.
 */
const setKeyShareInDB = (email: string, keyShare: string): void => {
  try {
    const stmt = db.query(`INSERT OR REPLACE INTO ${TABLE_NAME} (${COLUMN_EMAIL}, ${COLUMN_KEY_SHARE}) VALUES (?, ?)`);
    stmt.run(email, keyShare);
    console.log(`Successfully set keyShare for email: ${email}`);
  } catch (error) {
    console.error(`Failed to set keyShare for email: ${email}`, error);
  }
};

export { getKeyShareInDB, setKeyShareInDB };
