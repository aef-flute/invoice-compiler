import ClientForm from "@/components/client-form";
import { createClient } from "../actions";
export const dynamic = 'force-dynamic';


export default function NewClientPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add Client</h1>
      <ClientForm action={createClient} />
    </div>
  );
}
