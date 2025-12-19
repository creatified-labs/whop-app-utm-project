import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks, advancedLinkSessions, advancedLinkOrders } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
	try {
		const [linksWithMetrics, sessionRows, orderRows] = await Promise.all([
			db
				.select({
					id: advancedLinks.id,
					name: advancedLinks.name,
					slug: advancedLinks.slug,
					product: advancedLinks.product,
					productPrice: advancedLinks.productPrice,
					trackingUrl: advancedLinks.trackingUrl,
					destination: advancedLinks.destination,
					utmSource: advancedLinks.utmSource,
					utmMedium: advancedLinks.utmMedium,
					utmCampaign: advancedLinks.utmCampaign,
					metaPixelEnabled: advancedLinks.metaPixelEnabled,
					archived: advancedLinks.archived,
					createdAt: advancedLinks.createdAt,
					clicks: sql<number>`(
						SELECT COUNT(*)::int
						FROM ${advancedLinkSessions}
						WHERE ${advancedLinkSessions.advancedLinkId}::text = ${advancedLinks.id}::text
					)`,
					orders: sql<number>`(
						SELECT COUNT(*)::int
						FROM ${advancedLinkOrders}
						WHERE ${advancedLinkOrders.advancedLinkId}::text = ${advancedLinks.id}::text
					)`,
					revenue: sql<number>`(
						SELECT COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int
						FROM ${advancedLinkOrders}
						WHERE ${advancedLinkOrders.advancedLinkId}::text = ${advancedLinks.id}::text
					)`,
				})
				.from(advancedLinks),
			db
				.select({
					id: advancedLinkSessions.id,
					advancedLinkId: advancedLinkSessions.advancedLinkId,
					sessionToken: advancedLinkSessions.sessionToken,
					clickedAt: advancedLinkSessions.clickedAt,
				})
				.from(advancedLinkSessions),
			db
				.select({
					id: advancedLinkOrders.id,
					advancedLinkId: advancedLinkOrders.advancedLinkId,
					amountCents: advancedLinkOrders.amountCents,
					currency: advancedLinkOrders.currency,
					sessionToken: advancedLinkOrders.sessionToken,
					whopUserId: advancedLinkOrders.whopUserId,
					createdAt: advancedLinkOrders.createdAt,
				})
				.from(advancedLinkOrders),
		]);

		// Transform to match TrackingLink type
		const links = linksWithMetrics.map((link) => ({
			id: link.id,
			name: link.name,
			slug: link.slug,
			product: link.product,
			productPrice: link.productPrice || undefined,
			trackingUrl: link.trackingUrl || undefined,
			destination: link.destination,
			utmSource: link.utmSource || undefined,
			utmMedium: link.utmMedium || undefined,
			utmCampaign: link.utmCampaign || undefined,
			metaPixelEnabled: link.metaPixelEnabled || undefined,
			archived: link.archived || false,
			createdAt: link.createdAt,
			clicks: link.clicks || 0,
			convertedUsers: link.orders || 0,
			revenueGenerated: (link.revenue || 0) / 100, // Convert cents to dollars
			conversionRate: link.clicks > 0 ? (link.orders || 0) / link.clicks : 0,
		}));

		// Fetch all sessions for events (sessions represent clicks)
		const sessions = await db
			.select({
				id: advancedLinkSessions.id,
				linkId: advancedLinkSessions.advancedLinkId,
				createdAt: advancedLinkSessions.clickedAt,
			})
			.from(advancedLinkSessions);

		const events = sessions.map((session) => ({
			id: session.id,
			visitorId: "unknown", // We don't track individual visitor IDs
			linkId: session.linkId,
			type: "click" as const,
			occurredAt: session.createdAt?.toISOString() || new Date().toISOString(),
		}));

		// Fetch all orders
		const ordersData = await db
			.select({
				id: advancedLinkOrders.id,
				linkId: advancedLinkOrders.advancedLinkId,
				amountCents: advancedLinkOrders.amountCents,
				currency: advancedLinkOrders.currency,
				createdAt: advancedLinkOrders.createdAt,
				whopUserId: advancedLinkOrders.whopUserId,
			})
			.from(advancedLinkOrders);

		const orders = ordersData.map((order) => ({
			id: order.id,
			visitorId: order.whopUserId || "unknown",
			linkId: order.linkId,
			product: "Advanced Link Purchase",
			amount: order.amountCents / 100, // Convert cents to dollars
			currency: (order.currency || "USD") as "USD" | "GBP" | "EUR",
		}));

		return NextResponse.json({ links, events, orders }, { status: 200 });
	} catch (error) {
		console.error("[/api/advanced-links-data] Error:", error);

		return NextResponse.json({ links: [], events: [], orders: [] }, { status: 500 });
	}
}
