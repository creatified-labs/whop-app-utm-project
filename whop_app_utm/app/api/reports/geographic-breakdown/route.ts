import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkSessions, advancedLinkOrders } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
	try {
		// Get session counts by country
		const sessionsByCountry = await db
			.select({
				countryCode: advancedLinkSessions.countryCode,
				countryName: advancedLinkSessions.countryName,
				sessions: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.where(sql`${advancedLinkSessions.countryCode} IS NOT NULL`)
			.groupBy(advancedLinkSessions.countryCode, advancedLinkSessions.countryName);

		// Get orders and revenue by country
		const ordersByCountry = await db
			.select({
				countryCode: advancedLinkOrders.countryCode,
				orders: sql<number>`COUNT(*)::int`,
				revenue: sql<number>`SUM(${advancedLinkOrders.amountCents})::int`,
			})
			.from(advancedLinkOrders)
			.where(sql`${advancedLinkOrders.countryCode} IS NOT NULL`)
			.groupBy(advancedLinkOrders.countryCode);

		// Merge the data
		const countryMap = new Map<string, any>();

		sessionsByCountry.forEach((item) => {
			countryMap.set(item.countryCode!, {
				countryCode: item.countryCode,
				countryName: item.countryName || item.countryCode,
				sessions: item.sessions,
				orders: 0,
				revenue: 0,
			});
		});

		ordersByCountry.forEach((item) => {
			const existing = countryMap.get(item.countryCode!);
			if (existing) {
				existing.orders = item.orders;
				existing.revenue = item.revenue / 100; // Convert cents to dollars
			} else {
				countryMap.set(item.countryCode!, {
					countryCode: item.countryCode,
					countryName: item.countryCode, // Fallback to code if no name
					sessions: 0,
					orders: item.orders,
					revenue: item.revenue / 100,
				});
			}
		});

		// Convert to array and calculate percentages
		const totalSessions = Array.from(countryMap.values()).reduce(
			(sum, item) => sum + item.sessions,
			0
		);

		const breakdown = Array.from(countryMap.values())
			.map((item) => ({
				...item,
				percentage: totalSessions > 0 ? (item.sessions / totalSessions) * 100 : 0,
			}))
			.sort((a, b) => b.revenue - a.revenue); // Sort by revenue

		return NextResponse.json({ breakdown, totalSessions }, { status: 200 });
	} catch (error) {
		console.error("[/api/reports/geographic-breakdown] Error:", error);
		return NextResponse.json({ breakdown: [], totalSessions: 0 }, { status: 500 });
	}
}
