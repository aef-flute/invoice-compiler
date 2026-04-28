import db from "@/db";
import { formatCurrency } from "@/lib/format";
export const dynamic = 'force-dynamic';


type QuarterlyRow = {
  client_name: string;
  quarter: string;
  year: string;
  total: number;
};

function getQuarterlyData(): QuarterlyRow[] {
  return db
    .prepare(
      `SELECT
        c.name as client_name,
        CASE
          WHEN CAST(strftime('%m', i.date) AS INTEGER) BETWEEN 1 AND 3 THEN 'Q1'
          WHEN CAST(strftime('%m', i.date) AS INTEGER) BETWEEN 4 AND 6 THEN 'Q2'
          WHEN CAST(strftime('%m', i.date) AS INTEGER) BETWEEN 7 AND 9 THEN 'Q3'
          ELSE 'Q4'
        END as quarter,
        strftime('%Y', i.date) as year,
        SUM(i.total) as total
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      GROUP BY c.name, year, quarter
      ORDER BY year, quarter, c.name`
    )
    .all() as QuarterlyRow[];
}

export default function DashboardPage() {
  const data = getQuarterlyData();

  // Build a matrix: rows = quarters, columns = clients + total
  const clientNames = [...new Set(data.map((d) => d.client_name))].sort();
  const periods = [
    ...new Set(data.map((d) => `${d.year} ${d.quarter}`)),
  ].sort();

  const matrix: Record<string, Record<string, number>> = {};
  for (const period of periods) {
    matrix[period] = {};
  }
  for (const row of data) {
    const key = `${row.year} ${row.quarter}`;
    matrix[key][row.client_name] = row.total;
  }

  // Calculate totals
  const periodTotals: Record<string, number> = {};
  const clientTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const period of periods) {
    periodTotals[period] = 0;
    for (const client of clientNames) {
      const amount = matrix[period][client] || 0;
      periodTotals[period] += amount;
      clientTotals[client] = (clientTotals[client] || 0) + amount;
      grandTotal += amount;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Income Dashboard
      </h1>

      {data.length === 0 ? (
        <p className="text-gray-500">
          No invoice data yet. Create some invoices to see your income
          breakdown.
        </p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatCurrency(grandTotal)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Invoices</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {data.reduce((_, d) => _ + 1, 0)} entries
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-500">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {clientNames.length}
              </p>
            </div>
          </div>

          {/* Quarterly Breakdown Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Period
                  </th>
                  {clientNames.map((name) => (
                    <th
                      key={name}
                      className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {name}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {periods.map((period) => (
                  <tr key={period} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {period}
                    </td>
                    {clientNames.map((name) => (
                      <td
                        key={name}
                        className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700"
                      >
                        {matrix[period][name]
                          ? formatCurrency(matrix[period][name])
                          : "-"}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(periodTotals[period])}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    Total
                  </td>
                  {clientNames.map((name) => (
                    <td
                      key={name}
                      className="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                    >
                      {formatCurrency(clientTotals[name])}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                    {formatCurrency(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Simple Bar Chart */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quarterly Income
            </h2>
            <div className="space-y-3">
              {periods.map((period) => {
                const maxTotal = Math.max(...Object.values(periodTotals));
                const pct = maxTotal > 0 ? (periodTotals[period] / maxTotal) * 100 : 0;
                return (
                  <div key={period} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600 shrink-0">
                      {period}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gray-800 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-24 text-sm font-medium text-gray-900 text-right shrink-0">
                      {formatCurrency(periodTotals[period])}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
