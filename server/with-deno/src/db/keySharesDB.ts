// deno-lint-ignore-file require-await
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

const DB_PATH = "./keyShares.db";
const TABLE_NAME = "keyShares";
const COLUMN_EMAIL = "email";
const COLUMN_KEY_SHARE = "keyShare";

let db: DB;
try {
  db = new DB(DB_PATH);
  db.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      ${COLUMN_EMAIL} TEXT PRIMARY KEY NOT NULL,
      ${COLUMN_KEY_SHARE} TEXT NOT NULL
    )
  `);
} catch (error) {
  console.error("[DB Error] Failed to initialize database:", error);
  Deno.exit(1);
}

// Cache prepared statements for better performance
let getStmt: ReturnType<DB["prepareQuery"]> | null = null;
let setStmt: ReturnType<DB["prepareQuery"]> | null = null;

function prepareStatements() {
  if (!getStmt) {
    getStmt = db.prepareQuery<[string], { keyShare: string }>(
      `SELECT ${COLUMN_KEY_SHARE} AS keyShare FROM ${TABLE_NAME} WHERE ${COLUMN_EMAIL} = ?`
    );
  }
  if (!setStmt) {
    setStmt = db.prepareQuery(
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
    if (!getStmt) {
      throw new Error("Database statement 'getStmt' is not prepared.");
    }
    const result = getStmt.all([email]);

    return result.length > 0 ? (result[0] as unknown as { keyShare: string }).keyShare : null;
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
    if (!setStmt) {
      throw new Error("Database statement 'setStmt' is not prepared.");
    }
    setStmt.execute([email, keyShare]);

    if (db.totalChanges === 0) {
      console.warn(`[DB Warning] No changes made when setting keyShare for email "${email}".`);
    } else {
      console.log(`[DB Info] Successfully set keyShare for email "${email}".`);
    }
  } catch (error) {
    console.error(`[DB Error] Failed to set keyShare for email "${email}":`, error);
    throw error;
  }
}
