import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks, advancedLinkSessions } from "@/lib/db/schema";
import { eq, sql, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const companyId = searchParams.get("companyId");

		if (!companyId) {
			return NextResponse.json(
				{ error: "companyId required" },
				{ status: 400 }
			);
		}

		// Device breakdown
		const deviceStats = await db
			.select({
				deviceType: advancedLinkSessions.deviceType,
				clicks: sql<number>`COUNT(*)::int`,
				conversions: sql<number>`COUNT(${advancedLinkSessions.convertedAt})::int`,
			})
			.from(advancedLinkSessions)
			.innerJoin(
				advancedLinks,
				eq(advancedLinkSessions.advancedLinkId, advancedLinks.id)
			)
			.groupBy(advancedLinkSessions.deviceType);

		const totalClicks = deviceStats.reduce((sum, d) => sum + (d.clicks || 0), 0);

		// Browser breakdown
		const browserStats = await db
			.select({
				browser: advancedLinkSessions.browser,
				clicks: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.innerJoin(
				advancedLinks,
				eq(advancedLinkSessions.advancedLinkId, advancedLinks.id)
			)
			.where(isNotNull(advancedLinkSessions.browser))
			.groupBy(advancedLinkSessions.browser)
			.orderBy(sql`COUNT(*) DESC`)
			.limit(10);

		// Country breakdown
		const countryStats = await db
			.select({
				countryCode: advancedLinkSessions.countryCode,
				countryName: advancedLinkSessions.countryName,
				clicks: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.innerJoin(
				advancedLinks,
				eq(advancedLinkSessions.advancedLinkId, advancedLinks.id)
			)
			.where(isNotNull(advancedLinkSessions.countryCode))
			.groupBy(advancedLinkSessions.countryCode, advancedLinkSessions.countryName)
			.orderBy(sql`COUNT(*) DESC`)
			.limit(10);

		return NextResponse.json(
			{
				devices: deviceStats.map((d) => ({
					deviceType: d.deviceType || "unknown",
					clicks: d.clicks || 0,
					conversions: d.conversions || 0,
					percentage: totalClicks > 0 ? ((d.clicks || 0) / totalClicks) * 100 : 0,
					conversionRate: d.clicks > 0 ? ((d.conversions || 0) / d.clicks) * 100 : 0,
				})),
				browsers: browserStats.map((b) => ({
					browser: b.browser || "Unknown",
					clicks: b.clicks || 0,
				})),
				countries: countryStats.map((c) => ({
					countryCode: c.countryCode || "XX",
					countryName: c.countryName || "Unknown",
					clicks: c.clicks || 0,
				})),
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("[/api/analytics/device-breakdown] Error:", error);
		return NextResponse.json(
			{
				devices: [],
				browsers: [],
				countries: [],
				error: "Failed to fetch device breakdown",
			},
			{ status: 500 }
		);
	}
}
