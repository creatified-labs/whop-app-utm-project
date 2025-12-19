import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkClicks, advancedLinkOrders, advancedLinkSessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const linkId = searchParams.get("linkId");

	if (!linkId) {
		return NextResponse.json(
			{ error: "linkId is required" },
			{ status: 400 }
		);
	}

	try {
		// Fetch recent clicks (as events)
		const clicks = await db
			.select({
				id: advancedLinkClicks.id,
				createdAt: advancedLinkClicks.createdAt,
				ipHash: advancedLinkClicks.ipHash,
			})
			.from(advancedLinkClicks)
			.where(eq(advancedLinkClicks.advancedLinkId, linkId))
			.orderBy(desc(advancedLinkClicks.createdAt))
			.limit(50);

		// Fetch orders
		const orders = await db
			.select({
				id: advancedLinkOrders.id,
				whopOrderId: advancedLinkOrders.whopOrderId,
				amountCents: advancedLinkOrders.amountCents,
				currency: advancedLinkOrders.currency,
				deviceType: advancedLinkOrders.deviceType,
				createdAt: advancedLinkOrders.createdAt,
			})
			.from(advancedLinkOrders)
			.where(eq(advancedLinkOrders.advancedLinkId, linkId))
			.orderBy(desc(advancedLinkOrders.createdAt))
			.limit(50);

		// Fetch sessions for device breakdown
		const sessions = await db
			.select({
				deviceType: advancedLinkSessions.deviceType,
				browser: advancedLinkSessions.browser,
			})
			.from(advancedLinkSessions)
			.where(eq(advancedLinkSessions.advancedLinkId, linkId));

		// Calculate device breakdown
		const deviceCounts: Record<string, number> = {};
		for (const session of sessions) {
			const device = session.deviceType || "Unknown";
			deviceCounts[device] = (deviceCounts[device] || 0) + 1;
		}

		const deviceBreakdown = Object.entries(deviceCounts)
			.map(([device, count]) => ({ device, count }))
			.sort((a, b) => b.count - a.count);

		// Transform clicks into event format expected by the modal
		const events = clicks.map((click) => ({
			id: click.id,
			visitorId: click.ipHash.slice(0, 16), // Use truncated IP hash as visitor ID
			linkId,
			type: "click" as const,
			occurredAt: click.createdAt?.toISOString() ?? new Date().toISOString(),
		}));

		// Transform orders into the format expected by the modal
		const formattedOrders = orders.map((order) => ({
			id: order.id,
			visitorId: order.whopOrderId?.slice(0, 16) ?? order.id.slice(0, 16),
			linkId,
			product: "Purchase", // We don't have product name in orders table
			amount: (order.amountCents ?? 0) / 100,
			currency: (order.currency as "USD" | "GBP" | "EUR") ?? "USD",
			createdAt: order.createdAt?.toISOString() ?? new Date().toISOString(),
		}));

		return NextResponse.json({
			events,
			orders: formattedOrders,
			deviceBreakdown,
			hourlyClicks: [], // Could be computed if needed
		});
	} catch (error) {
		console.error("Error fetching link activity:", error);
		return NextResponse.json(
			{ error: "Failed to fetch link activity" },
			{ status: 500 }
		);
	}
}
