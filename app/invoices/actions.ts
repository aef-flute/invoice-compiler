"use server";

import db from "@/db";
import { revalidatePath } from "next/cache";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import { addDays } from "@/lib/format";

export type Invoice = {
  id: number;
  invoice_number: string;
  client_id: number;
  client_name: string;
  date: string;
  due_date: string;
  status: string;
  display_mode: string;
  notes: string | null;
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
};

export type InvoiceLineItem = {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  sort_order: number;
  date: string | null;
  hour_id: number | null;
};

export type InvoiceWithItems = Invoice & {
  line_items: InvoiceLineItem[];
  client: {
    name: string;
    email: string | null;
    address: string | null;
  };
};

export async function getInvoices(): Promise<Invoice[]> {
  return db
    .prepare(
      "SELECT i.*, c.name as client_name FROM invoices i JOIN clients c ON c.id = i.client_id ORDER BY i.date DESC"
    )
    .all() as Invoice[];
}

export async function getInvoice(
  id: number
): Promise<InvoiceWithItems | undefined> {
  const invoice = db
    .prepare(
      "SELECT i.*, c.name as client_name FROM invoices i JOIN clients c ON c.id = i.client_id WHERE i.id = ?"
    )
    .get(id) as Invoice | undefined;

  if (!invoice) return undefined;

  const lineItems = db
    .prepare(
      "SELECT * FROM invoice_line_items WHERE invoice_id = ? ORDER BY sort_order"
    )
    .all(id) as InvoiceLineItem[];

  const client = db
    .prepare("SELECT name, email, address FROM clients WHERE id = ?")
    .get(invoice.client_id) as {
    name: string;
    email: string | null;
    address: string | null;
  };

  return { ...invoice, line_items: lineItems, client };
}

export type CreateInvoiceInput = {
  clientId: number;
  date: string;
  dueDays: number;
  displayMode: "itemized" | "flattened";
  notes?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    date?: string;
    hourId?: number;
  }[];
  hourIds: number[];
};

export async function createInvoice(input: CreateInvoiceInput) {
  const invoiceNumber = generateInvoiceNumber(
    new Date(input.date + "T00:00:00").getFullYear()
  );
  const dueDate = addDays(input.date, input.dueDays);
  const total = input.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const result = db.transaction(() => {
    const res = db
      .prepare(
        `INSERT INTO invoices (invoice_number, client_id, date, due_date, status, display_mode, notes, subtotal, total)
         VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?)`
      )
      .run(
        invoiceNumber,
        input.clientId,
        input.date,
        dueDate,
        input.displayMode,
        input.notes || null,
        total,
        total
      );

    const invoiceId = res.lastInsertRowid as number;

    const insertItem = db.prepare(
      `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, total, sort_order, date, hour_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    input.lineItems.forEach((item, idx) => {
      insertItem.run(
        invoiceId,
        item.description,
        item.quantity,
        item.unitPrice,
        item.quantity * item.unitPrice,
        idx,
        item.date || null,
        item.hourId || null
      );
    });

    // Mark hours as invoiced
    if (input.hourIds.length > 0) {
      const markHour = db.prepare(
        "UPDATE hours SET invoiced = 1, invoice_id = ? WHERE id = ?"
      );
      for (const hourId of input.hourIds) {
        markHour.run(invoiceId, hourId);
      }
    }

    return invoiceId;
  })();

  revalidatePath("/invoices");
  revalidatePath("/hours");
  return result;
}

export async function updateInvoiceStatus(id: number, status: string) {
  db.prepare(
    "UPDATE invoices SET status = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(status, id);
  revalidatePath("/invoices");
}

export async function deleteInvoice(id: number) {
  db.transaction(() => {
    // Release hours back to uninvoiced
    db.prepare(
      "UPDATE hours SET invoiced = 0, invoice_id = NULL WHERE invoice_id = ?"
    ).run(id);
    // Delete line items (cascade should handle this, but be explicit)
    db.prepare("DELETE FROM invoice_line_items WHERE invoice_id = ?").run(id);
    db.prepare("DELETE FROM invoices WHERE id = ?").run(id);
  })();
  revalidatePath("/invoices");
  revalidatePath("/hours");
}

export async function getLastRateForClient(
  clientId: number
): Promise<number | null> {
  const row = db
    .prepare(
      `SELECT li.unit_price FROM invoice_line_items li
       JOIN invoices i ON i.id = li.invoice_id
       WHERE i.client_id = ? AND li.hour_id IS NOT NULL
       ORDER BY i.date DESC LIMIT 1`
    )
    .get(clientId) as { unit_price: number } | undefined;
  return row?.unit_price ?? null;
}
