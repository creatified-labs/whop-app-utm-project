import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkSessions } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
	try {
		const osData = await db
			.select({
				os: advancedLinkSessions.os,
				count: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.where(sql`${advancedLinkSessions.os} IS NOT NULL`)
			.groupBy(advancedLinkSessions.os)
			.orderBy(sql`COUNT(*) DESC`);

		const total = osData.reduce((sum, item) => sum + item.count, 0);

		const breakdown = osData.map((item) => ({
			os: item.os || "Unknown",
			count: item.count,
			percentage: total > 0 ? (item.count / total) * 100 : 0,
		}));

		return NextResponse.json({ breakdown, total }, { status: 200 });
	} catch (error) {
		console.error("[/api/reports/os-breakdown] Error:", error);
		return NextResponse.json({ breakdown: [], total: 0 }, { status: 500 });
	}
}
