import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkSessions, advancedLinkOrders } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
	try {
		// Query sessions grouped by device type with order counts and revenue
		const deviceData = await db
			.select({
				deviceType: advancedLinkSessions.deviceType,
				clicks: sql<number>`COUNT(DISTINCT ${advancedLinkSessions.id})::int`,
				orders: sql<number>`COUNT(DISTINCT ${advancedLinkOrders.id})::int`,
				revenue: sql<number>`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int`,
			})
			.from(advancedLinkSessions)
			.leftJoin(
				advancedLinkOrders,
				eq(advancedLinkSessions.sessionToken, advancedLinkOrders.sessionToken)
			)
			.groupBy(advancedLinkSessions.deviceType);

		const metrics = deviceData.map((row) => ({
			deviceType: row.deviceType || "unknown",
			clicks: row.clicks || 0,
			orders: row.orders || 0,
			revenue: (row.revenue || 0) / 100, // Convert cents to dollars
		}));

		return NextResponse.json({ metrics }, { status: 200 });
	} catch (error) {
		console.error("[/api/device-metrics] Error:", error);
		return NextResponse.json(
			{ metrics: [], error: "Failed to fetch device metrics" },
			{ status: 500 }
		);
	}
}
