import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks, advancedLinkSessions, advancedLinkOrders } from "@/lib/db/schema";
import { sql, and, gte, lte, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		// Build date filter conditions
		const dateConditions = [];
		if (startDate) {
			dateConditions.push(gte(advancedLinkOrders.createdAt, new Date(startDate)));
		}
		if (endDate) {
			dateConditions.push(lte(advancedLinkOrders.createdAt, new Date(endDate)));
		}

		// Query destination breakdown
		const destinationData = await db
			.select({
				destination: advancedLinks.destination,
				clicks: sql<number>`COUNT(DISTINCT ${advancedLinkSessions.id})::int`,
				orders: sql<number>`COUNT(DISTINCT ${advancedLinkOrders.id})::int`,
				revenue: sql<number>`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int`,
			})
			.from(advancedLinks)
			.leftJoin(
				advancedLinkSessions,
				and(
					sql`${advancedLinkSessions.advancedLinkId} = ${advancedLinks.id}`,
					...(startDate ? [gte(advancedLinkSessions.clickedAt, new Date(startDate))] : []),
					...(endDate ? [lte(advancedLinkSessions.clickedAt, new Date(endDate))] : [])
				)
			)
			.leftJoin(
				advancedLinkOrders,
				and(
					sql`${advancedLinkOrders.advancedLinkId} = ${advancedLinks.id}`,
					...dateConditions
				)
			)
			.where(isNotNull(advancedLinks.destination))
			.groupBy(advancedLinks.destination)
			.orderBy(sql`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0) DESC`);

		const breakdown = destinationData.map((row) => {
			const clicks = row.clicks || 0;
			const orders = row.orders || 0;
			const revenue = (row.revenue || 0) / 100;
			const conversionRate = clicks > 0 ? (orders / clicks) * 100 : 0;

			return {
				destination: row.destination || "unknown",
				clicks,
				orders,
				revenue,
				conversionRate: parseFloat(conversionRate.toFixed(2)),
			};
		});

		return NextResponse.json({ breakdown }, { status: 200 });
	} catch (error) {
		console.error("[/api/reports/destination-breakdown] Error:", error);
		return NextResponse.json(
			{ breakdown: [], error: "Failed to fetch destination breakdown" },
			{ status: 500 }
		);
	}
}
