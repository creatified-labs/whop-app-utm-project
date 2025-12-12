import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkSessions, advancedLinkOrders } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
	try {
		// Get device breakdown
		const deviceData = await db
			.select({
				deviceType: advancedLinkSessions.deviceType,
				count: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.groupBy(advancedLinkSessions.deviceType)
			.orderBy(sql`COUNT(*) DESC`);

		const totalSessions = deviceData.reduce((sum, row) => sum + (row.count || 0), 0);

		const devices = deviceData.map((row) => ({
			deviceType: row.deviceType || "unknown",
			count: row.count || 0,
			percentage: totalSessions > 0 ? ((row.count || 0) / totalSessions) * 100 : 0,
		}));

		// Get browser breakdown
		const browserData = await db
			.select({
				browser: advancedLinkSessions.browser,
				count: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.groupBy(advancedLinkSessions.browser)
			.orderBy(sql`COUNT(*) DESC`)
			.limit(10);

		const browsers = browserData.map((row) => ({
			browser: row.browser || "unknown",
			count: row.count || 0,
			percentage: totalSessions > 0 ? ((row.count || 0) / totalSessions) * 100 : 0,
		}));

		// Get OS breakdown
		const osData = await db
			.select({
				os: advancedLinkSessions.os,
				count: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.groupBy(advancedLinkSessions.os)
			.orderBy(sql`COUNT(*) DESC`)
			.limit(10);

		const operatingSystems = osData.map((row) => ({
			os: row.os || "unknown",
			count: row.count || 0,
			percentage: totalSessions > 0 ? ((row.count || 0) / totalSessions) * 100 : 0,
		}));

		// Get country breakdown
		const countryData = await db
			.select({
				countryCode: advancedLinkSessions.countryCode,
				count: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.where(sql`${advancedLinkSessions.countryCode} IS NOT NULL`)
			.groupBy(advancedLinkSessions.countryCode)
			.orderBy(sql`COUNT(*) DESC`)
			.limit(10);

		const countries = countryData.map((row) => ({
			countryCode: row.countryCode || "unknown",
			count: row.count || 0,
			percentage: totalSessions > 0 ? ((row.count || 0) / totalSessions) * 100 : 0,
		}));

		return NextResponse.json(
			{
				totalSessions,
				devices,
				browsers,
				operatingSystems,
				countries,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("[/api/device-breakdown] Error:", error);
		return NextResponse.json(
			{
				totalSessions: 0,
				devices: [],
				browsers: [],
				operatingSystems: [],
				countries: [],
				error: "Failed to fetch device breakdown",
			},
			{ status: 500 }
		);
	}
}
