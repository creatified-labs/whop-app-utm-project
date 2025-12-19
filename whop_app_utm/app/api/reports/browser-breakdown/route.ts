import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkSessions } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
	try {
		const browserData = await db
			.select({
				browser: advancedLinkSessions.browser,
				count: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.where(sql`${advancedLinkSessions.browser} IS NOT NULL`)
			.groupBy(advancedLinkSessions.browser)
			.orderBy(sql`COUNT(*) DESC`);

		const total = browserData.reduce((sum, item) => sum + item.count, 0);

		const breakdown = browserData.map((item) => ({
			browser: item.browser || "Unknown",
			count: item.count,
			percentage: total > 0 ? (item.count / total) * 100 : 0,
		}));

		return NextResponse.json({ breakdown, total }, { status: 200 });
	} catch (error) {
		console.error("[/api/reports/browser-breakdown] Error:", error);
		return NextResponse.json({ breakdown: [], total: 0 }, { status: 500 });
	}
}
