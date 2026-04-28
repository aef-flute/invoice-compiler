import { createClient } from "@libsql/client";
import type { Client, InValue } from "@libsql/client";
import fs from "fs";
import path from "path";

let client: Client | null = null;

function getDb() {
  if (client) return client;

  // Skip database initialization during build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error("Database not available during build");
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
  }

  client = createClient({ url, authToken });

  // Initialize schema if needed
  initializeSchema();

  return client;
}

async function initializeSchema() {
  if (!client) return;

  try {
    // Check if tables exist
    const result = await client.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='clients'"
    );

    if (result.rows.length === 0) {
      // Read and execute schema
      const schema = fs.readFileSync(
        path.join(process.cwd(), "db", "schema.sql"),
        "utf-8"
      );
      
      // Split by semicolon and execute each statement
      const statements = schema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await client.execute(statement);
      }
    }
  } catch (error) {
    console.error("Failed to initialize schema:", error);
  }
}

// Adapter to make Turso client work with existing code
const dbAdapter = {
  prepare(sql: string) {
    return {
      run(...params: InValue[]) {
        const db = getDb();
        return db.execute({ sql, args: params });
      },
      get(...params: InValue[]) {
        const db = getDb();
        return db.execute({ sql, args: params }).then((result) => result.rows[0]);
      },
      all(...params: InValue[]) {
        const db = getDb();
        return db.execute({ sql, args: params }).then((result) => result.rows);
      },
    };
  },
  transaction(fn: () => void) {
    return () => {
      // Turso doesn't support explicit transactions in the same way
      // For now, just execute the function
      fn();
    };
  },
  pragma() {
    // No-op for Turso
  },
  exec(sql: string) {
    const db = getDb();
    return db.execute(sql);
  },
};

export default dbAdapter as any;