import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

function getDb() {
  if (db) return db;

  // Skip database initialization during build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error("Database not available during build");
  }

  const dbPath = path.join(process.cwd(), "data", "invoicing.db");
  const dataDir = path.dirname(dbPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
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

  return db;
}

// Export a proxy that lazily initializes the database
export default new Proxy({} as Database.Database, {
  get(target, prop) {
    const database = getDb();
    const value = database[prop as keyof Database.Database];
    if (typeof value === "function") {
      return value.bind(database);
    }
    return value;
  },
});