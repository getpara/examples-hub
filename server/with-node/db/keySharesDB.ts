import sqlite3 from "sqlite3";

sqlite3.verbose();

const DB_PATH = "./keyShares.db";
const TABLE_NAME = "keyShares";
const COLUMN_EMAIL = "email";
const COLUMN_KEY_SHARE = "keyShare";

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Could not open database:", err.message);
  } else {
    db.run(
      `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        ${COLUMN_EMAIL} TEXT PRIMARY KEY,
        ${COLUMN_KEY_SHARE} TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Failed to create table:", err.message);
        }
      }
    );
  }
});

/**
 * Fetches the keyShare associated with the given email.
 *
 * @param {string} email - The email to search for in the database.
 * @returns {Promise<string | null>} - The keyShare if found, otherwise null.
 */
const getKeyShareInDB = async (email: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT ${COLUMN_KEY_SHARE} FROM ${TABLE_NAME} WHERE ${COLUMN_EMAIL} = ?`, [email], (err, row) => {
      if (err) {
        console.error(`Failed to get keyShare for email: ${email}`, err);
        reject(null);
      } else {
        resolve(row ? (row as any)[COLUMN_KEY_SHARE] : null);
      }
    });
  });
};

/**
 * Sets or updates the keyShare associated with the given email.
 *
 * @param {string} email - The email for which the keyShare should be set.
 * @param {string} keyShare - The keyShare string to store in the database.
 * @returns {Promise<void>}
 */
const setKeyShareInDB = async (email: string, keyShare: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO ${TABLE_NAME} (${COLUMN_EMAIL}, ${COLUMN_KEY_SHARE}) VALUES (?, ?)`,
      [email, keyShare],
      (err) => {
        if (err) {
          console.error(`Failed to set keyShare for email: ${email}`, err);
          reject(err);
        } else {
          console.log(`Successfully set keyShare for email: ${email}`);
          resolve();
        }
      }
    );
  });
};

export { getKeyShareInDB, setKeyShareInDB };
