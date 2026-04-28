"use client";

import { useRef } from "react";
import { createHour } from "@/app/hours/actions";
import { type Client } from "@/app/clients/actions";

export default function HourForm({ clients }: { clients: Client[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createHour(formData);
        formRef.current?.reset();
        // Re-focus the date field for quick sequential entry
        const dateInput = formRef.current?.querySelector<HTMLInputElement>(
          'input[name="date"]'
        );
        dateInput?.focus();
      }}
      className="rounded-lg border border-gray-200 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label
            htmlFor="client_id"
            className="block text-sm font-medium text-gray-700"
          >
            Client
          </label>
          <select
            id="client_id"
            name="client_id"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <option value="">Select...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            required
            placeholder="What did you work on?"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label
              htmlFor="hours"
              className="block text-sm font-medium text-gray-700"
            >
              Hours
            </label>
            <input
              type="number"
              id="hours"
              name="hours"
              required
              step="0.25"
              min="0.25"
              placeholder="0"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Log
          </button>
        </div>
      </div>
    </form>
  );
}
