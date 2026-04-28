"use client";

import { useRouter } from "next/navigation";
import { type Client } from "@/app/clients/actions";

type Props = {
  client?: Client;
  action: (formData: FormData) => Promise<void>;
};

export default function ClientForm({ client, action }: Props) {
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        await action(formData);
        router.push("/clients");
      }}
      className="space-y-4 max-w-lg"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={client?.name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={client?.email ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Billing Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          defaultValue={client?.address ?? ""}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="default_rate"
            className="block text-sm font-medium text-gray-700"
          >
            Default Rate ($)
          </label>
          <input
            type="number"
            id="default_rate"
            name="default_rate"
            step="0.01"
            defaultValue={client?.default_rate ?? ""}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label
            htmlFor="rate_type"
            className="block text-sm font-medium text-gray-700"
          >
            Rate Type
          </label>
          <select
            id="rate_type"
            name="rate_type"
            defaultValue={client?.rate_type ?? "hourly"}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="hourly">Hourly</option>
            <option value="half-day">Half-day</option>
            <option value="day">Day</option>
            <option value="flat">Flat</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          {client ? "Update Client" : "Add Client"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/clients")}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
