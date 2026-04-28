import { notFound } from "next/navigation";
import Link from "next/link";
import { getInvoice } from "../actions";
import { formatCurrency, formatDate } from "@/lib/format";
import StatusBadge from "@/components/status-badge";
import InvoiceActions from "@/components/invoice-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(parseInt(id, 10));
  if (!invoice) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Invoices
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-semibold text-gray-900">
            {invoice.invoice_number}
          </h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/invoices/${invoice.id}/pdf`}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Download PDF
          </a>
          <InvoiceActions id={invoice.id} status={invoice.status} />
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 max-w-3xl">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
            <p className="text-sm text-gray-600 mt-1">
              {invoice.invoice_number}
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>
              <span className="font-medium">Date:</span>{" "}
              {formatDate(invoice.date)}
            </p>
            <p>
              <span className="font-medium">Due:</span>{" "}
              {formatDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 mb-1">
              From
            </p>
            <p className="text-sm font-medium text-gray-900">
              Extempore Productions
            </p>
            <p className="text-sm text-gray-600">46 New York Ave, Apt 1L</p>
            <p className="text-sm text-gray-600">Brooklyn, NY 11216</p>
            <p className="text-sm text-gray-600">(651) 675 7951</p>
            <p className="text-sm text-gray-600">
              ariephraimfeldman@gmail.com
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500 mb-1">
              Bill To
            </p>
            <p className="text-sm font-medium text-gray-900">
              {invoice.client.name}
            </p>
            {invoice.client.address && (
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {invoice.client.address}
              </p>
            )}
            {invoice.client.email && (
              <p className="text-sm text-gray-600">{invoice.client.email}</p>
            )}
          </div>
        </div>

        {/* Notes / Description */}
        {invoice.notes && (
          <p className="text-sm font-medium text-gray-700 mb-4">
            {invoice.notes}
          </p>
        )}

        {/* Line Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="pb-2 text-left text-xs font-medium uppercase text-gray-500">
                Description
              </th>
              <th className="pb-2 text-right text-xs font-medium uppercase text-gray-500">
                Qty
              </th>
              <th className="pb-2 text-right text-xs font-medium uppercase text-gray-500">
                Rate
              </th>
              <th className="pb-2 text-right text-xs font-medium uppercase text-gray-500">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.line_items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 text-sm text-gray-700">
                  {item.date && (
                    <span className="text-gray-400 mr-2">
                      {formatDate(item.date)}
                    </span>
                  )}
                  {item.description}
                </td>
                <td className="py-2 text-right text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="py-2 text-right text-sm text-gray-900">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="py-2 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td
                colSpan={3}
                className="pt-3 text-right text-sm font-semibold text-gray-900"
              >
                Total
              </td>
              <td className="pt-3 text-right text-sm font-semibold text-gray-900">
                {formatCurrency(invoice.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Payment Details */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs font-medium uppercase text-gray-500 mb-1">
            Payment Details
          </p>
          <p className="text-sm text-gray-600">
            Please pay via check or via ACH. Please call for ACH information.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>www.ariephraimfeldman.com</p>
        </div>
      </div>
    </div>
  );
}
