import db from "./index";

// Idempotency: skip if clients already exist
const existing = db.prepare("SELECT COUNT(*) as c FROM clients").get() as {
  c: number;
};
if (existing.c > 0) {
  console.log("Database already seeded. Skipping.");
  process.exit(0);
}

// --- Seed clients ---
const clients = [
  {
    name: "Legal Services NYC",
    email: null,
    address: "40 Worth Street\nSuite 606\nNew York, NY 10013",
    default_rate: 50,
    rate_type: "hourly",
  },
  {
    name: "Alix of Bohemia",
    email: "camilla@alixofbohemia.com",
    address: "61 Greenpoint Ave\nSuite 301\nBrooklyn, NY 11222",
    default_rate: 50,
    rate_type: "hourly",
  },
  {
    name: "StevieMada",
    email: "steviemada@gmail.com",
    address: null,
    default_rate: 300,
    rate_type: "half-day",
  },
];

const clientIds: Record<string, number> = {};
const insertClient = db.prepare(
  "INSERT INTO clients (name, email, address, default_rate, rate_type) VALUES (?, ?, ?, ?, ?)"
);
for (const c of clients) {
  const res = insertClient.run(
    c.name,
    c.email,
    c.address,
    c.default_rate,
    c.rate_type
  );
  clientIds[c.name] = res.lastInsertRowid as number;
}

// --- Seed invoices ---
type LineItem = { description: string; qty: number; unit_price: number };
type HistoricalInvoice = {
  invoice_number: string;
  client: string;
  date: string;
  due_date: string;
  notes: string;
  status: "paid";
  display_mode: "itemized" | "flattened";
  items: LineItem[];
};

const invoices: HistoricalInvoice[] = [
  {
    invoice_number: "INV-2025-001",
    client: "Alix of Bohemia",
    date: "2025-01-03",
    due_date: "2025-02-03",
    notes: "PF25 - Photoshoot Production and BTS Services",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Day rate - production services", qty: 2, unit_price: 400 },
      { description: "Hourly rate - production services", qty: 7, unit_price: 25 },
    ],
  },
  {
    invoice_number: "INV-2025-002",
    client: "Alix of Bohemia",
    date: "2025-01-05",
    due_date: "2025-02-05",
    notes: "Holiday 'Sip & Shop' Production Services and Event Photography",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Hourly rate - production services", qty: 2, unit_price: 35 },
      { description: "Hourly rate - photography services", qty: 4, unit_price: 50 },
    ],
  },
  {
    invoice_number: "INV-2025-003",
    client: "Legal Services NYC",
    date: "2025-02-05",
    due_date: "2025-03-05",
    notes: "Media consulting services - 1/24/25-2/1/25",
    status: "paid",
    display_mode: "flattened",
    items: [{ description: "Hourly rate", qty: 20, unit_price: 50 }],
  },
  {
    invoice_number: "INV-2025-004",
    client: "Alix of Bohemia",
    date: "2025-02-05",
    due_date: "2025-03-05",
    notes: "FW25 - Photoshoot photography and production services",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Hourly rate - production assistance", qty: 4, unit_price: 35 },
      { description: "Day rate - production services", qty: 2, unit_price: 400 },
      { description: "Hourly rate - photography services", qty: 4, unit_price: 50 },
      { description: "Reimbursement - photoshoot groceries", qty: 1, unit_price: 229.44 },
      { description: "Reimbursement - photoshoot breakfast", qty: 1, unit_price: 107.83 },
    ],
  },
  {
    invoice_number: "INV-2025-005",
    client: "Legal Services NYC",
    date: "2025-03-17",
    due_date: "2025-03-28",
    notes: "Video Production Services - Feb 10 - March 14",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 43,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-006",
    client: "Legal Services NYC",
    date: "2025-04-14",
    due_date: "2025-04-28",
    notes: "Video Production Services - March 17 - March 29",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 38,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-007",
    client: "Legal Services NYC",
    date: "2025-04-15",
    due_date: "2025-04-28",
    notes: "Video Production Services - March 31 - April 11",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 40,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-008",
    client: "Legal Services NYC",
    date: "2025-05-07",
    due_date: "2025-05-19",
    notes: "Video Production Services - April 11-25",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 36,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-009",
    client: "Alix of Bohemia",
    date: "2025-05-12",
    due_date: "2025-05-26",
    notes: "CFDA Video Shoot",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Hourly rate - video production prep", qty: 3, unit_price: 50 },
      { description: "Hourly rate - video production services", qty: 9, unit_price: 50 },
      { description: "Reimbursement - after-hours dinner", qty: 1, unit_price: 20.99 },
    ],
  },
  {
    invoice_number: "INV-2025-010",
    client: "Legal Services NYC",
    date: "2025-05-12",
    due_date: "2025-06-02",
    notes: "Video Production Services - April 28-May 9",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 32,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-011",
    client: "Alix of Bohemia",
    date: "2025-06-06",
    due_date: "2025-06-06",
    notes:
      "RS25 - Photoshoot photography and production services and Summer Salon",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Hourly rate - pre-production RS25", qty: 4, unit_price: 40 },
      { description: "Day rate - production services RS25", qty: 2, unit_price: 400 },
      { description: "Overtime - production services RS25 5/20", qty: 6, unit_price: 52.5 },
      { description: "Hourly rate - photography services RS25", qty: 4, unit_price: 50 },
      { description: "Hourly rate - photography services - accessories", qty: 2, unit_price: 50 },
      { description: "Hourly rate - photography services - Summer Salon 2025", qty: 5, unit_price: 50 },
    ],
  },
  {
    invoice_number: "INV-2025-012",
    client: "Legal Services NYC",
    date: "2025-06-06",
    due_date: "2025-06-20",
    notes: "Video Production Services - May 12-23",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 29,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-013",
    client: "Legal Services NYC",
    date: "2025-07-24",
    due_date: "2025-08-07",
    notes: "Video Production Services - May 26-July 18 2025",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 78,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-014",
    client: "Legal Services NYC",
    date: "2025-08-28",
    due_date: "2025-09-11",
    notes: "Video Production Services - July 21-Aug 22 2025",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 65,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-015",
    client: "Alix of Bohemia",
    date: "2025-08-28",
    due_date: "2025-09-11",
    notes: "SS26 - Photoshoot BTS and production services",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Hourly rate - pre-production", qty: 3, unit_price: 40 },
      { description: "Day rate - production services", qty: 1, unit_price: 450 },
      { description: "Overtime - production services", qty: 4, unit_price: 60 },
    ],
  },
  {
    invoice_number: "INV-2025-016",
    client: "StevieMada",
    date: "2025-10-24",
    due_date: "2025-10-24",
    notes: "Photoshoot assistant services - Watch campaign",
    status: "paid",
    display_mode: "itemized",
    items: [{ description: "Half-day rate", qty: 2, unit_price: 300 }],
  },
  {
    invoice_number: "INV-2025-017",
    client: "Legal Services NYC",
    date: "2025-10-24",
    due_date: "2025-11-07",
    notes: "Video Production Services - Aug 25 2025-Oct 17 2025",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 85,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2025-018",
    client: "Alix of Bohemia",
    date: "2025-10-24",
    due_date: "2025-11-07",
    notes: "Runway Show - Production Services",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Day rate - production services", qty: 1, unit_price: 450 },
      { description: "Overtime - production services", qty: 4, unit_price: 60 },
      { description: "Hourly rate - production services (shipping assistance)", qty: 2, unit_price: 45 },
    ],
  },
  {
    invoice_number: "INV-2026-001",
    client: "Alix of Bohemia",
    date: "2026-02-09",
    due_date: "2026-02-23",
    notes: "FW26 - Photoshoot BTS and production services",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Hourly rate - pre-production", qty: 3, unit_price: 40 },
      { description: "Day rate - production services", qty: 2, unit_price: 500 },
      { description: "Overtime - production services", qty: 4, unit_price: 60 },
      { description: "Photo Editing", qty: 2, unit_price: 50 },
      { description: "Purchase Reimbursement", qty: 1, unit_price: 82.41 },
    ],
  },
  {
    invoice_number: "INV-2026-002",
    client: "Legal Services NYC",
    date: "2026-02-09",
    due_date: "2026-02-23",
    notes: "Video Production Services - Oct. 21 2025 - Feb. 6 2026",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 66,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2026-003",
    client: "Alix of Bohemia",
    date: "2026-02-20",
    due_date: "2026-03-06",
    notes: "FW26 - NYFW Show Production Services",
    status: "paid",
    display_mode: "itemized",
    items: [
      { description: "Event Rate - In-House Co-Producer", qty: 1, unit_price: 2000 },
      { description: "Subcontractor Payment", qty: 12, unit_price: 40 },
      { description: "Reimbursement - Astor Wine purchase", qty: 1, unit_price: 1861.01 },
      { description: "Reimbursement - Parking Ticket (Flower District)", qty: 1, unit_price: 115 },
    ],
  },
  {
    invoice_number: "INV-2026-004",
    client: "Legal Services NYC",
    date: "2026-02-23",
    due_date: "2026-03-09",
    notes: "Video Production Services - Feb. 11 2026 - Feb. 20 2026",
    status: "paid",
    display_mode: "flattened",
    items: [
      {
        description:
          "Short video production and editing; video archive management; general communications consulting",
        qty: 11,
        unit_price: 50,
      },
    ],
  },
  {
    invoice_number: "INV-2026-005",
    client: "Legal Services NYC",
    date: "2026-03-02",
    due_date: "2026-03-16",
    notes: "Media relations - Feb. 17 2026 - Feb. 28 2026",
    status: "paid",
    display_mode: "flattened",
    items: [
      { description: "Media relations and trainings", qty: 24, unit_price: 50 },
    ],
  },
  {
    invoice_number: "INV-2026-006",
    client: "Legal Services NYC",
    date: "2026-03-23",
    due_date: "2026-03-30",
    notes: "Media relations - March 2-20 2026",
    status: "paid",
    display_mode: "flattened",
    items: [
      { description: "Media relations and trainings", qty: 33, unit_price: 50 },
    ],
  },
  {
    invoice_number: "INV-2026-007",
    client: "Legal Services NYC",
    date: "2026-04-14",
    due_date: "2026-04-27",
    notes: "Media relations - March 23 - April 10 2026",
    status: "paid",
    display_mode: "flattened",
    items: [
      { description: "Media relations and trainings", qty: 36, unit_price: 50 },
    ],
  },
];

const insertInvoice = db.prepare(
  `INSERT INTO invoices (invoice_number, client_id, date, due_date, status, display_mode, notes, subtotal, total)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const insertLineItem = db.prepare(
  `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, total, sort_order)
   VALUES (?, ?, ?, ?, ?, ?)`
);

const insertAll = db.transaction(() => {
  for (const inv of invoices) {
    const total = inv.items.reduce(
      (s, it) => s + it.qty * it.unit_price,
      0
    );
    const res = insertInvoice.run(
      inv.invoice_number,
      clientIds[inv.client],
      inv.date,
      inv.due_date,
      inv.status,
      inv.display_mode,
      inv.notes,
      total,
      total
    );
    const invoiceId = res.lastInsertRowid as number;
    inv.items.forEach((item, idx) => {
      insertLineItem.run(
        invoiceId,
        item.description,
        item.qty,
        item.unit_price,
        item.qty * item.unit_price,
        idx
      );
    });
  }
});

insertAll();

console.log(`Seeded ${clients.length} clients and ${invoices.length} invoices.`);
