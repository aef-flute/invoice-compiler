CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT,
  address      TEXT,
  default_rate REAL,
  rate_type    TEXT DEFAULT 'hourly',
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hours (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id   INTEGER NOT NULL REFERENCES clients(id),
  date        TEXT NOT NULL,
  description TEXT NOT NULL,
  hours       REAL NOT NULL,
  invoiced    INTEGER DEFAULT 0,
  invoice_id  INTEGER REFERENCES invoices(id),
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id     INTEGER NOT NULL REFERENCES clients(id),
  date          TEXT NOT NULL,
  due_date      TEXT NOT NULL,
  status        TEXT DEFAULT 'draft',
  display_mode  TEXT DEFAULT 'itemized',
  notes         TEXT,
  subtotal      REAL NOT NULL DEFAULT 0,
  total         REAL NOT NULL DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    REAL NOT NULL,
  unit_price  REAL NOT NULL,
  total       REAL NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  date        TEXT,
  hour_id     INTEGER REFERENCES hours(id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_hours_client_date ON hours(client_id, date);
CREATE INDEX IF NOT EXISTS idx_hours_invoiced ON hours(invoiced);
CREATE INDEX IF NOT EXISTS idx_line_items_invoice ON invoice_line_items(invoice_id);
