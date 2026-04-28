"use server";

import db from "@/db";
import { revalidatePath } from "next/cache";

export type HourEntry = {
  id: number;
  client_id: number;
  client_name: string;
  date: string;
  description: string;
  hours: number;
  invoiced: number;
  invoice_id: number | null;
  created_at: string;
};

export async function getHours(filters?: {
  clientId?: number;
  startDate?: string;
  endDate?: string;
  invoiced?: boolean;
}): Promise<HourEntry[]> {
  let query =
    "SELECT h.*, c.name as client_name FROM hours h JOIN clients c ON c.id = h.client_id WHERE 1=1";
  const params: (string | number)[] = [];

  if (filters?.clientId) {
    query += " AND h.client_id = ?";
    params.push(filters.clientId);
  }
  if (filters?.startDate) {
    query += " AND h.date >= ?";
    params.push(filters.startDate);
  }
  if (filters?.endDate) {
    query += " AND h.date <= ?";
    params.push(filters.endDate);
  }
  if (filters?.invoiced !== undefined) {
    query += " AND h.invoiced = ?";
    params.push(filters.invoiced ? 1 : 0);
  }

  query += " ORDER BY h.date DESC, h.created_at DESC";

  const result = await db.prepare(query).all(...params);
  return result as HourEntry[];
}

export async function createHour(formData: FormData) {
  const clientId = parseInt(formData.get("client_id") as string, 10);
  const date = formData.get("date") as string;
  const description = formData.get("description") as string;
  const hours = parseFloat(formData.get("hours") as string);

  await db
    .prepare(
      "INSERT INTO hours (client_id, date, description, hours) VALUES (?, ?, ?, ?)"
    )
    .run(clientId, date, description, hours);

  revalidatePath("/hours");
}

export async function deleteHour(id: number) {
  const entry = await db.prepare("SELECT invoiced FROM hours WHERE id = ?").get(id) as
    | { invoiced: number }
    | undefined;
  if (entry?.invoiced) {
    throw new Error("Cannot delete an invoiced hour entry");
  }
  await db.prepare("DELETE FROM hours WHERE id = ?").run(id);
  revalidatePath("/hours");
}

export async function getUninvoicedHours(
  clientId: number,
  startDate?: string,
  endDate?: string
): Promise<HourEntry[]> {
  let query =
    "SELECT h.*, c.name as client_name FROM hours h JOIN clients c ON c.id = h.client_id WHERE h.client_id = ? AND h.invoiced = 0";
  const params: (string | number)[] = [clientId];

  if (startDate) {
    query += " AND h.date >= ?";
    params.push(startDate);
  }
  if (endDate) {
    query += " AND h.date <= ?";
    params.push(endDate);
  }

  query += " ORDER BY h.date ASC";

  const result = await db.prepare(query).all(...params);
  return result as HourEntry[];
}