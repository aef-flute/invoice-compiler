"use client";

import Link from "next/link";
import { updateInvoiceStatus, deleteInvoice } from "@/app/invoices/actions";

export default function InvoiceActions({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/invoices/${id}`}
        className="text-gray-600 hover:text-gray-900 text-xs font-medium"
      >
        View
      </Link>
      <a
        href={`/invoices/${id}/pdf`}
        className="text-gray-600 hover:text-gray-900 text-xs font-medium"
      >
        PDF
      </a>
      {status === "draft" && (
        <button
          onClick={() => updateInvoiceStatus(id, "sent")}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
        >
          Mark Sent
        </button>
      )}
      {(status === "draft" || status === "sent") && (
        <button
          onClick={() => updateInvoiceStatus(id, "paid")}
          className="text-green-600 hover:text-green-800 text-xs font-medium"
        >
          Mark Paid
        </button>
      )}
      {status === "draft" && (
        <button
          onClick={() => {
            if (confirm("Delete this invoice?")) {
              deleteInvoice(id);
            }
          }}
          className="text-red-600 hover:text-red-800 text-xs font-medium"
        >
          Delete
        </button>
      )}
    </div>
  );
}
