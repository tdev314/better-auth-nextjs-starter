import { db } from "@/database/db"
import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
	try {
		const start = Date.now()
		await db.execute(sql`SELECT 1`)
		const latency = Date.now() - start

		return NextResponse.json(
			{ status: "healthy", database: "connected", latency_ms: latency },
			{ status: 200 },
		)
	} catch {
		return NextResponse.json(
			{ status: "unhealthy", database: "disconnected" },
			{ status: 503 },
		)
	}
}
