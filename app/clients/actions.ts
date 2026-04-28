"use server";

import db from "@/db";
import { revalidatePath } from "next/cache";

export type Client = {
  id: number;
  name: string;
  email: string | null;
  address: string | null;
  default_rate: number | null;
  rate_type: string;
  created_at: string;
  updated_at: string;
};

export async function getClients(): Promise<Client[]> {
  return db.prepare("SELECT * FROM clients ORDER BY name").all() as Client[];
}

export async function getClient(id: number): Promise<Client | undefined> {
  return db.prepare("SELECT * FROM clients WHERE id = ?").get(id) as
    | Client
    | undefined;
}

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || null;
  const address = (formData.get("address") as string) || null;
  const defaultRate = formData.get("default_rate")
    ? parseFloat(formData.get("default_rate") as string)
    : null;
  const rateType = (formData.get("rate_type") as string) || "hourly";

  db.prepare(
    "INSERT INTO clients (name, email, address, default_rate, rate_type) VALUES (?, ?, ?, ?, ?)"
  ).run(name, email, address, defaultRate, rateType);

  revalidatePath("/clients");
}

export async function updateClient(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string) || null;
  const address = (formData.get("address") as string) || null;
  const defaultRate = formData.get("default_rate")
    ? parseFloat(formData.get("default_rate") as string)
    : null;
  const rateType = (formData.get("rate_type") as string) || "hourly";

  db.prepare(
    "UPDATE clients SET name = ?, email = ?, address = ?, default_rate = ?, rate_type = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(name, email, address, defaultRate, rateType, id);

  revalidatePath("/clients");
}
