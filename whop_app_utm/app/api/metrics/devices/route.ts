import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks, advancedLinkSessions, advancedLinkOrders } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

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

		// Query device stats with clicks and conversions
		const deviceData = await db
			.select({
				deviceType: advancedLinkSessions.deviceType,
				browser: advancedLinkSessions.browser,
				clicks: sql<number>`COUNT(*)::int`,
				conversions: sql<number>`COUNT(${advancedLinkSessions.convertedAt})::int`,
			})
			.from(advancedLinkSessions)
			.innerJoin(
				advancedLinks,
				eq(advancedLinkSessions.advancedLinkId, advancedLinks.id)
			)
			.groupBy(advancedLinkSessions.deviceType, advancedLinkSessions.browser);

		const totalClicks = deviceData.reduce((sum, d) => sum + (d.clicks || 0), 0);

		const devices = deviceData.map((row) => ({
			deviceType: row.deviceType || "unknown",
			browser: row.browser || "unknown",
			clicks: row.clicks || 0,
			conversions: row.conversions || 0,
			percentage: totalClicks > 0 ? ((row.clicks || 0) / totalClicks) * 100 : 0,
		}));

		return NextResponse.json({ devices }, { status: 200 });
	} catch (error) {
		console.error("[/api/metrics/devices] Error:", error);
		return NextResponse.json(
			{ devices: [], error: "Failed to fetch device metrics" },
			{ status: 500 }
		);
	}
}
