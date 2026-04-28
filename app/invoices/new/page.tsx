import { getClients } from "@/app/clients/actions";
import InvoiceBuilder from "@/components/invoice-builder";

export default async function NewInvoicePage() {
  const clients = await getClients();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        New Invoice
      </h1>
      <InvoiceBuilder clients={clients} />
    </div>
  );
}
