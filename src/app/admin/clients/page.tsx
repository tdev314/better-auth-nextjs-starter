import { getClients } from "@/lib/actions/admin-clients"
import { ClientTable } from "@/components/admin/client-table"
import { CreateClientDialog } from "@/components/admin/create-client-dialog"

export default async function ClientsPage() {
    const clients = await getClients()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">OAuth Clients</h2>
                    <p className="text-sm text-muted-foreground">
                        {clients.length} registered {clients.length === 1 ? "client" : "clients"}
                    </p>
                </div>
                <CreateClientDialog />
            </div>
            <ClientTable clients={clients} />
        </div>
    )
}
