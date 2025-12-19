import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks, advancedLinkSessions, advancedLinkOrders } from "@/lib/db/schema";
import { sql, eq, and, isNotNull, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const companyId = searchParams.get("companyId");

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId required" },
				{ status: 400 }
			);
		}

		// Query campaigns with clicks, orders, and revenue
		const campaignData = await db
			.select({
				campaign: advancedLinkOrders.utmCampaign,
				clicks: sql<number>`COUNT(DISTINCT ${advancedLinkSessions.id})::int`,
				orders: sql<number>`COUNT(DISTINCT ${advancedLinkOrders.id})::int`,
				revenue: sql<number>`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int`,
			})
			.from(advancedLinkOrders)
			.innerJoin(
				advancedLinks,
				eq(advancedLinkOrders.advancedLinkId, advancedLinks.id)
			)
			.leftJoin(
				advancedLinkSessions,
				eq(advancedLinkOrders.sessionToken, advancedLinkSessions.sessionToken)
			)
			.where(
				and(
					isNotNull(advancedLinkOrders.utmCampaign)
				)
			)
			.groupBy(advancedLinkOrders.utmCampaign)
			.orderBy(desc(sql`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)`));

		const campaigns = campaignData.map((row) => ({
			campaign: row.campaign || "unknown",
			clicks: row.clicks || 0,
			orders: row.orders || 0,
			revenue: (row.revenue || 0) / 100,
			conversionRate: row.clicks > 0 ? ((row.orders || 0) / row.clicks) * 100 : 0,
		}));

		return NextResponse.json({ campaigns }, { status: 200 });
	} catch (error) {
		console.error("[/api/metrics/campaigns] Error:", error);
		return NextResponse.json(
			{ campaigns: [], error: "Failed to fetch campaign metrics" },
			{ status: 500 }
		);
	}
}
