import db from "@/db";

export async function generateInvoiceNumber(year?: number): Promise<string> {
  const y = year ?? new Date().getFullYear();
  const prefix = `INV-${y}-`;

  const row = await db
    .prepare(
      "SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY invoice_number DESC LIMIT 1"
    )
    .get(`${prefix}%`) as { invoice_number: string } | undefined;

  let nextNum = 1;
  if (row) {
    const lastNum = parseInt(row.invoice_number.split("-")[2], 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}