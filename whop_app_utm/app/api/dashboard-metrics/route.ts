import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks, advancedLinkClicks, advancedLinkOrders } from "@/lib/db/schema";
import { sql, eq, and, gte } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const dateRange = searchParams.get("dateRange") || "30d";

		// Calculate date threshold based on range
		const now = new Date();
		let daysAgo = 30;
		if (dateRange === "7d") daysAgo = 7;
		else if (dateRange === "90d") daysAgo = 90;

		const dateThreshold = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

		// Get clicks by date
		const clicksByDate = await db
			.select({
				date: sql<string>`DATE(${advancedLinkClicks.createdAt})`,
				clicks: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkClicks)
			.where(gte(advancedLinkClicks.createdAt, dateThreshold))
			.groupBy(sql`DATE(${advancedLinkClicks.createdAt})`)
			.orderBy(sql`DATE(${advancedLinkClicks.createdAt})`);

		// Get revenue by date
		const revenueByDate = await db
			.select({
				date: sql<string>`DATE(${advancedLinkOrders.createdAt})`,
				revenue: sql<number>`SUM(${advancedLinkOrders.amountCents})::int`,
				orders: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkOrders)
			.where(gte(advancedLinkOrders.createdAt, dateThreshold))
			.groupBy(sql`DATE(${advancedLinkOrders.createdAt})`)
			.orderBy(sql`DATE(${advancedLinkOrders.createdAt})`);

		// Get top performing links
		const topLinks = await db
			.select({
				id: advancedLinks.id,
				name: advancedLinks.name,
				clicks: sql<number>`(
					SELECT COUNT(*)::int 
					FROM ${advancedLinkClicks} 
					WHERE ${advancedLinkClicks.advancedLinkId} = ${advancedLinks.id}
					AND ${advancedLinkClicks.createdAt} >= ${dateThreshold}
				)`,
				orders: sql<number>`(
					SELECT COUNT(*)::int 
					FROM ${advancedLinkOrders} 
					WHERE ${advancedLinkOrders.advancedLinkId} = ${advancedLinks.id}
					AND ${advancedLinkOrders.createdAt} >= ${dateThreshold}
				)`,
				revenue: sql<number>`(
					SELECT COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int 
					FROM ${advancedLinkOrders} 
					WHERE ${advancedLinkOrders.advancedLinkId} = ${advancedLinks.id}
					AND ${advancedLinkOrders.createdAt} >= ${dateThreshold}
				)`,
			})
			.from(advancedLinks)
			.orderBy(sql`(
				SELECT COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)
				FROM ${advancedLinkOrders}
				WHERE ${advancedLinkOrders.advancedLinkId} = ${advancedLinks.id}
				AND ${advancedLinkOrders.createdAt} >= ${dateThreshold}
			) DESC`)
			.limit(10);

		// Get top performing sources
		const topSources = await db
			.select({
				utmSource: advancedLinks.utmSource,
				clicks: sql<number>`COUNT(DISTINCT ${advancedLinkClicks.id})::int`,
				orders: sql<number>`COUNT(DISTINCT ${advancedLinkOrders.id})::int`,
				revenue: sql<number>`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int`,
			})
			.from(advancedLinks)
			.leftJoin(
				advancedLinkClicks,
				and(
					eq(advancedLinkClicks.advancedLinkId, advancedLinks.id),
					gte(advancedLinkClicks.createdAt, dateThreshold)
				)
			)
			.leftJoin(
				advancedLinkOrders,
				and(
					eq(advancedLinkOrders.advancedLinkId, advancedLinks.id),
					gte(advancedLinkOrders.createdAt, dateThreshold)
				)
			)
			.where(sql`${advancedLinks.utmSource} IS NOT NULL`)
			.groupBy(advancedLinks.utmSource)
			.orderBy(sql`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0) DESC`)
			.limit(10);

		return NextResponse.json(
			{
				dateRange,
				clicksByDate: clicksByDate.map((row) => ({
					date: row.date,
					clicks: row.clicks || 0,
				})),
				revenueByDate: revenueByDate.map((row) => ({
					date: row.date,
					revenue: (row.revenue || 0) / 100,
					orders: row.orders || 0,
				})),
				topLinks: topLinks.map((link) => ({
					id: link.id,
					name: link.name,
					clicks: link.clicks || 0,
					orders: link.orders || 0,
					revenue: (link.revenue || 0) / 100,
					conversionRate: link.clicks > 0 ? (link.orders || 0) / link.clicks : 0,
				})),
				topSources: topSources.map((source) => ({
					utmSource: source.utmSource || "unknown",
					clicks: source.clicks || 0,
					orders: source.orders || 0,
					revenue: (source.revenue || 0) / 100,
				})),
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("[/api/dashboard-metrics] Error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch dashboard metrics",
				clicksByDate: [],
				revenueByDate: [],
				topLinks: [],
				topSources: [],
			},
			{ status: 500 }
		);
	}
}
