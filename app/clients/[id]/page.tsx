import { notFound } from "next/navigation";
import ClientForm from "@/components/client-form";
import { getClient, updateClient } from "../actions";
export const dynamic = 'force-dynamic';


export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(parseInt(id, 10));
  if (!client) notFound();

  const action = updateClient.bind(null, client.id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Edit Client
      </h1>
      <ClientForm client={client} action={action} />
    </div>
  );
}
