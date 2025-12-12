import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkOrders } from "@/lib/db/schema";
import { sql, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");
		const granularity = searchParams.get("granularity") || "day"; // day, week, month

		// Build date filter conditions
		const dateConditions = [];
		if (startDate) {
			dateConditions.push(gte(advancedLinkOrders.createdAt, new Date(startDate)));
		}
		if (endDate) {
			dateConditions.push(lte(advancedLinkOrders.createdAt, new Date(endDate)));
		}

		// Determine date truncation based on granularity
		let dateTrunc: any;
		switch (granularity) {
			case "week":
				dateTrunc = sql`DATE_TRUNC('week', ${advancedLinkOrders.createdAt})`;
				break;
			case "month":
				dateTrunc = sql`DATE_TRUNC('month', ${advancedLinkOrders.createdAt})`;
				break;
			case "day":
			default:
				dateTrunc = sql`DATE(${advancedLinkOrders.createdAt})`;
				break;
		}

		// Query revenue over time
		const revenueData = await db
			.select({
				date: sql<string>`${dateTrunc}::text`,
				revenue: sql<number>`SUM(${advancedLinkOrders.amountCents})::int`,
				orders: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkOrders)
			.where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
			.groupBy(dateTrunc)
			.orderBy(dateTrunc);

		const timeSeries = revenueData.map((row) => ({
			date: row.date,
			revenue: (row.revenue || 0) / 100, // Convert cents to dollars
			orders: row.orders || 0,
		}));

		return NextResponse.json({ timeSeries, granularity }, { status: 200 });
	} catch (error) {
		console.error("[/api/reports/revenue-over-time] Error:", error);
		return NextResponse.json(
			{ timeSeries: [], granularity: "day", error: "Failed to fetch revenue over time" },
			{ status: 500 }
		);
	}
}
