import { getHours } from "./actions";
import { getClients } from "@/app/clients/actions";
import HourForm from "@/components/hour-form";
import HourTable from "@/components/hour-table";
export const dynamic = 'force-dynamic';


export default async function HoursPage() {
  const [hours, clients] = await Promise.all([getHours(), getClients()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Log Hours</h1>
      <HourForm clients={clients} />
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Hours</h2>
        <HourTable hours={hours} />
      </div>
    </div>
  );
}
