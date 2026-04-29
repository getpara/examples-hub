import path from "node:path";
import { open, type Database } from "sqlite";
import sqlite3 from "sqlite3";
import type { PregenWalletStore, StoredPregenWallet } from "@/lib/para/pregenClaimService";

const DB_FILENAME = "pregen-wallets.db";
const DB_PATH = path.resolve(process.cwd(), DB_FILENAME);
const TABLE_NAME = "pregen_wallet_claims";

let dbPromise: Promise<Database> | null = null;

type StoredPregenWalletRow = {
  claim_email: string;
  custom_id: string;
  encrypted_user_share: string;
  wallet_address: string | null;
  wallet_id: string;
  para_identifier: string;
  para_identifier_type: "CUSTOM_ID" | "EMAIL";
};

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
        claim_email TEXT PRIMARY KEY NOT NULL,
        custom_id TEXT UNIQUE NOT NULL,
        encrypted_user_share TEXT NOT NULL,
        wallet_address TEXT,
        wallet_id TEXT NOT NULL,
        para_identifier TEXT NOT NULL,
        para_identifier_type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
    );

    return db;
  } catch (error) {
    dbPromise = null;
    throw error;
  }
}

export async function getWalletByEmail(email: string): Promise<StoredPregenWallet | null> {
  const db = await getDb();
  const row = await db.get<StoredPregenWalletRow>(
    `SELECT * FROM ${TABLE_NAME} WHERE claim_email = ?`,
    [email],
  );

  return row ? mapStoredWalletRow(row) : null;
}

export async function storeWallet(wallet: StoredPregenWallet): Promise<void> {
  const db = await getDb();

  await db.run(
    `INSERT INTO ${TABLE_NAME} (
      claim_email,
      custom_id,
      encrypted_user_share,
      wallet_address,
      wallet_id,
      para_identifier,
      para_identifier_type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(claim_email) DO UPDATE SET
      custom_id = excluded.custom_id,
      encrypted_user_share = excluded.encrypted_user_share,
      wallet_address = excluded.wallet_address,
      wallet_id = excluded.wallet_id,
      para_identifier = excluded.para_identifier,
      para_identifier_type = excluded.para_identifier_type,
      updated_at = CURRENT_TIMESTAMP`,
    [
      wallet.claimEmail,
      wallet.customId,
      wallet.encryptedUserShare,
      wallet.walletAddress,
      wallet.walletId,
      wallet.paraIdentifier,
      wallet.paraIdentifierType,
    ],
  );
}

export async function markWalletIdentifierUpdated(
  email: string,
  identifier: string,
  identifierType: "EMAIL",
): Promise<void> {
  const db = await getDb();

  await db.run(
    `UPDATE ${TABLE_NAME}
     SET para_identifier = ?,
         para_identifier_type = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE claim_email = ?`,
    [identifier, identifierType, email],
  );
}

export const pregenWalletStore: PregenWalletStore = {
  getByEmail: getWalletByEmail,
  save: storeWallet,
  markIdentifierUpdated: markWalletIdentifierUpdated,
};

function mapStoredWalletRow(row: StoredPregenWalletRow): StoredPregenWallet {
  return {
    claimEmail: row.claim_email,
    customId: row.custom_id,
    encryptedUserShare: row.encrypted_user_share,
    walletAddress: row.wallet_address,
    walletId: row.wallet_id,
    paraIdentifier: row.para_identifier,
    paraIdentifierType: row.para_identifier_type,
  };
}
