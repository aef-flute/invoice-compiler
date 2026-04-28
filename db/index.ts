import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "invoicing.db");
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Auto-initialize schema if tables don't exist
const tableCheck = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='clients'")
  .get();

if (!tableCheck) {
  const schema = fs.readFileSync(
    path.join(process.cwd(), "db", "schema.sql"),
    "utf-8"
  );
  db.exec(schema);
}

export default db;
