import { notFound } from "next/navigation"

import { getClient } from "@/lib/actions/admin-clients"
import { ClientForm } from "@/components/admin/client-form"

export default async function ClientDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const client = await getClient(id)
    if (!client) notFound()

    return <ClientForm client={client} />
}
