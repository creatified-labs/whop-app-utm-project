import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks, advancedLinkClicks, advancedLinkOrders } from "@/lib/db/schema";
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

		// Query campaign breakdown
		const campaignData = await db
			.select({
				utmCampaign: advancedLinks.utmCampaign,
				clicks: sql<number>`COUNT(DISTINCT ${advancedLinkClicks.id})::int`,
				orders: sql<number>`COUNT(DISTINCT ${advancedLinkOrders.id})::int`,
				revenue: sql<number>`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int`,
			})
			.from(advancedLinks)
			.leftJoin(
				advancedLinkClicks,
				and(
					sql`${advancedLinkClicks.advancedLinkId} = ${advancedLinks.id}`,
					...(startDate ? [gte(advancedLinkClicks.createdAt, new Date(startDate))] : []),
					...(endDate ? [lte(advancedLinkClicks.createdAt, new Date(endDate))] : [])
				)
			)
			.leftJoin(
				advancedLinkOrders,
				and(
					sql`${advancedLinkOrders.advancedLinkId} = ${advancedLinks.id}`,
					...dateConditions
				)
			)
			.where(isNotNull(advancedLinks.utmCampaign))
			.groupBy(advancedLinks.utmCampaign)
			.orderBy(sql`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0) DESC`);

		const breakdown = campaignData.map((row) => {
			const clicks = row.clicks || 0;
			const orders = row.orders || 0;
			const revenue = (row.revenue || 0) / 100; // Convert cents to dollars
			const conversionRate = clicks > 0 ? (orders / clicks) * 100 : 0;

			return {
				campaign: row.utmCampaign || "unknown",
				clicks,
				orders,
				revenue,
				conversionRate: parseFloat(conversionRate.toFixed(2)),
			};
		});

		return NextResponse.json({ breakdown }, { status: 200 });
	} catch (error) {
		console.error("[/api/reports/campaign-breakdown] Error:", error);
		return NextResponse.json(
			{ breakdown: [], error: "Failed to fetch campaign breakdown" },
			{ status: 500 }
		);
	}
}
