import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkOrders } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
	try {
		const hourlyData = await db
			.select({
				hour: sql<number>`EXTRACT(HOUR FROM ${advancedLinkOrders.createdAt})::int`,
				orders: sql<number>`COUNT(*)::int`,
				revenue: sql<number>`SUM(${advancedLinkOrders.amountCents})::int`,
			})
			.from(advancedLinkOrders)
			.groupBy(sql`EXTRACT(HOUR FROM ${advancedLinkOrders.createdAt})`)
			.orderBy(sql`EXTRACT(HOUR FROM ${advancedLinkOrders.createdAt})`);

		// Fill in missing hours with 0 values
		const breakdown = Array.from({ length: 24 }, (_, hour) => {
			const found = hourlyData.find((item) => item.hour === hour);
			return {
				hour,
				orders: found?.orders || 0,
				revenue: found ? found.revenue / 100 : 0, // Convert cents to dollars
			};
		});

		return NextResponse.json({ breakdown }, { status: 200 });
	} catch (error) {
		console.error("[/api/reports/peak-hours] Error:", error);
		return NextResponse.json({ breakdown: [] }, { status: 500 });
	}
}
