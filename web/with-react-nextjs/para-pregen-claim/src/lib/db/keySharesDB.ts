import { open, type Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_FILENAME = 'pregen-wallets.db';
const DB_PATH = path.resolve(process.cwd(), DB_FILENAME);
const TABLE_NAME = 'pregen_wallets';

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
        email TEXT PRIMARY KEY NOT NULL,
        encrypted_user_share TEXT NOT NULL,
        wallet_address TEXT,
        wallet_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    dbPromise = null;
    throw error;
  }
}

export interface StoredWallet {
  email: string;
  encrypted_user_share: string;
  wallet_address: string | null;
  wallet_id: string | null;
  created_at: string;
}

export async function getWalletByEmail(email: string): Promise<StoredWallet | null> {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email provided');
  }

  const db = await getDb();
  const normalizedEmail = email.toLowerCase();

  const row = await db.get<StoredWallet>(
    `SELECT * FROM ${TABLE_NAME} WHERE email = ?`,
    [normalizedEmail]
  );

  return row ?? null;
}

export async function storeWallet(
  email: string,
  encryptedUserShare: string,
  walletAddress?: string,
  walletId?: string
): Promise<void> {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email provided');
  }
  if (!encryptedUserShare || typeof encryptedUserShare !== 'string') {
    throw new Error('Invalid encryptedUserShare provided');
  }

  const db = await getDb();
  const normalizedEmail = email.toLowerCase();

  await db.run(
    `INSERT INTO ${TABLE_NAME} (email, encrypted_user_share, wallet_address, wallet_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       encrypted_user_share = excluded.encrypted_user_share,
       wallet_address = excluded.wallet_address,
       wallet_id = excluded.wallet_id`,
    [normalizedEmail, encryptedUserShare, walletAddress ?? null, walletId ?? null]
  );
}

export async function hasWallet(email: string): Promise<boolean> {
  const wallet = await getWalletByEmail(email);
  return wallet !== null;
}
