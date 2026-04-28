import Link from "next/link";
import { getClients } from "./actions";
import { formatCurrency } from "@/lib/format";
export const dynamic = 'force-dynamic';


export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <Link
          href="/clients/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-gray-500">No clients yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors"
            >
              <h2 className="text-lg font-medium text-gray-900">
                {client.name}
              </h2>
              {client.email && (
                <p className="mt-1 text-sm text-gray-500">{client.email}</p>
              )}
              {client.address && (
                <p className="mt-1 text-sm text-gray-500 whitespace-pre-line">
                  {client.address}
                </p>
              )}
              {client.default_rate && (
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {formatCurrency(client.default_rate)}/{client.rate_type === "half-day" ? "half-day" : "hr"}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
