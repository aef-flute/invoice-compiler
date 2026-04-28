"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Client } from "@/app/clients/actions";
import { type HourEntry, getUninvoicedHours } from "@/app/hours/actions";
import {
  createInvoice,
  getLastRateForClient,
} from "@/app/invoices/actions";
import { formatDate, formatCurrency } from "@/lib/format";

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  date?: string;
  hourId?: number;
  isAdHoc?: boolean;
};

export default function InvoiceBuilder({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [displayMode, setDisplayMode] = useState<"itemized" | "flattened">(
    "flattened"
  );
  const [rate, setRate] = useState<number>(0);
  const [dueDays, setDueDays] = useState(14);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [hours, setHours] = useState<HourEntry[]>([]);
  const [adHocItems, setAdHocItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch uninvoiced hours when client or date range changes
  useEffect(() => {
    if (!clientId) {
      setHours([]);
      return;
    }
    setLoading(true);
    getUninvoicedHours(
      clientId as number,
      startDate || undefined,
      endDate || undefined
    ).then((h) => {
      setHours(h);
      setLoading(false);
    });
  }, [clientId, startDate, endDate]);

  // Fetch last rate when client changes
  useEffect(() => {
    if (!clientId) return;
    getLastRateForClient(clientId as number).then((lastRate) => {
      if (lastRate !== null) {
        setRate(lastRate);
      } else {
        const client = clients.find((c) => c.id === clientId);
        setRate(client?.default_rate ?? 0);
      }
    });
  }, [clientId, clients]);

  const totalHours = hours.reduce((sum, h) => sum + h.hours, 0);

  const hourLineItems: LineItem[] =
    displayMode === "itemized"
      ? hours.map((h) => ({
          description: h.description,
          quantity: h.hours,
          unitPrice: rate,
          date: h.date,
          hourId: h.id,
        }))
      : totalHours > 0
      ? [
          {
            description: notes || "Professional services",
            quantity: totalHours,
            unitPrice: rate,
          },
        ]
      : [];

  const allLineItems = [...hourLineItems, ...adHocItems];
  const total = allLineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const addAdHocItem = () => {
    setAdHocItems([
      ...adHocItems,
      { description: "", quantity: 1, unitPrice: 0, isAdHoc: true },
    ]);
  };

  const updateAdHocItem = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updated = [...adHocItems];
    (updated[index] as Record<string, unknown>)[field] = value;
    setAdHocItems(updated);
  };

  const removeAdHocItem = (index: number) => {
    setAdHocItems(adHocItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!clientId || allLineItems.length === 0) return;
    setSaving(true);
    try {
      const invoiceId = await createInvoice({
        clientId: clientId as number,
        date: invoiceDate,
        dueDays,
        displayMode,
        notes: notes || undefined,
        lineItems: allLineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          date: item.date,
          hourId: item.hourId,
        })),
        hourIds: hours.map((h) => h.id),
      });
      router.push(`/invoices/${invoiceId}`);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client + Date Selection */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Client
            </label>
            <select
              value={clientId}
              onChange={(e) =>
                setClientId(e.target.value ? parseInt(e.target.value, 10) : "")
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rate ($/hr)
            </label>
            <input
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Payment Due (days)
            </label>
            <input
              type="number"
              value={dueDays}
              onChange={(e) => setDueDays(parseInt(e.target.value, 10) || 14)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Description / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Video Production Services - March 2026"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Display Mode Toggle */}
      {hours.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            Display mode:
          </span>
          <div className="flex rounded-md border border-gray-300">
            <button
              type="button"
              onClick={() => setDisplayMode("flattened")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                displayMode === "flattened"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              } rounded-l-md`}
            >
              Flattened
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("itemized")}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                displayMode === "itemized"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              } rounded-r-md`}
            >
              Itemized
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {totalHours} hours from {hours.length} entries
          </span>
        </div>
      )}

      {/* Line Items Preview */}
      {clientId && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">Line Items</h2>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-gray-500">
              Loading hours...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {displayMode === "itemized" && (
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hourLineItems.map((item, i) => (
                    <tr key={`hour-${i}`}>
                      {displayMode === "itemized" && (
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                          {item.date ? formatDate(item.date) : ""}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.description}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}

                  {adHocItems.map((item, i) => (
                    <tr key={`adhoc-${i}`} className="bg-yellow-50">
                      {displayMode === "itemized" && (
                        <td className="px-4 py-3" />
                      )}
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            updateAdHocItem(i, "description", e.target.value)
                          }
                          placeholder="Reimbursement, flat fee, etc."
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateAdHocItem(
                              i,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          step="0.01"
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateAdHocItem(
                              i,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          step="0.01"
                          className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm"
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAdHocItem(i)}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={displayMode === "itemized" ? 4 : 3}
                      className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                    >
                      Total
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div className="px-5 py-4 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={addAdHocItem}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              + Add line item
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || allLineItems.length === 0}
              className="rounded-md bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
