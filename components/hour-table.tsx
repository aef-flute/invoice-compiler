"use client";

import { type HourEntry } from "@/app/hours/actions";
import { deleteHour } from "@/app/hours/actions";
import { formatDate } from "@/lib/format";

export default function HourTable({ hours }: { hours: HourEntry[] }) {
  if (hours.length === 0) {
    return <p className="text-sm text-gray-500">No hours logged yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Client
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Hours
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {hours.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                {formatDate(entry.date)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                {entry.client_name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {entry.description}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                {entry.hours}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                {entry.invoiced ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Invoiced
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    Open
                  </span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                {!entry.invoiced && (
                  <button
                    onClick={() => deleteHour(entry.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
