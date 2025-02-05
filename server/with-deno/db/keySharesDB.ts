import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";

const db = new DB("./keyShares.db");
db.query(`CREATE TABLE IF NOT EXISTS keyShares (email TEXT PRIMARY KEY, keyShare TEXT)`);

const getKeyShareInDB = (email: string): string => {
  const result = [...db.query("SELECT keyShare FROM keyShares WHERE email = ?", [email])];
  return result.length ? (result[0][0] as string) : "";
};

const setKeyShareInDB = (email: string, keyShare: string) => {
  db.query("INSERT OR REPLACE INTO keyShares (email, keyShare) VALUES (?, ?)", [email, keyShare]);
};

export { getKeyShareInDB, setKeyShareInDB };
