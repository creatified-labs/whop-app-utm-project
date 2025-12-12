import type {
	TrackingLink,
	VisitorEvent,
	Order,
	LinkMetrics,
	OverviewMetrics,
	SourceMetrics,
	CampaignMetrics,
	DeviceMetrics,
} from "./types";

export function getLinkMetrics(
	links: TrackingLink[],
	events: VisitorEvent[],
	orders: Order[],
): LinkMetrics[] {
	const clicksByLink = new Map<string, number>();
	const ordersByLink = new Map<string, { count: number; revenue: number }>();

	for (const ev of events) {
		if (ev.type === "click") {
			clicksByLink.set(ev.linkId, (clicksByLink.get(ev.linkId) ?? 0) + 1);
		}
	}

	for (const order of orders) {
		const existing = ordersByLink.get(order.linkId) ?? {
			count: 0,
			revenue: 0,
		};
		existing.count += 1;
		existing.revenue += order.amount;
		ordersByLink.set(order.linkId, existing);
	}

	const hasEventData = events.length > 0 || orders.length > 0;

	return links.map((link) => {
		if (hasEventData) {
			const clicks = clicksByLink.get(link.id) ?? 0;
			const orderBucket = ordersByLink.get(link.id) ?? { count: 0, revenue: 0 };
			const ordersCount = orderBucket.count;
			const revenue = orderBucket.revenue;
			const conversionRate = ordersCount / Math.max(clicks, 1);

			return {
				linkId: link.id,
				clicks,
				orders: ordersCount,
				revenue,
				conversionRate,
			};
		}

		const clicks = link.clicks ?? 0;
		const ordersCount = link.convertedUsers ?? 0;
		const revenue = link.revenueGenerated ?? 0;
		const conversionRate =
			link.conversionRate ?? ordersCount / Math.max(clicks || 1, 1);

		return {
			linkId: link.id,
			clicks,
			orders: ordersCount,
			revenue,
			conversionRate,
		};
	});
}

export function getOverviewMetrics(
	links: TrackingLink[],
	events: VisitorEvent[],
	orders: Order[],
): OverviewMetrics {
	const hasEventData = events.length > 0 || orders.length > 0;

	if (hasEventData) {
		const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
		const totalClicks = events.filter((ev) => ev.type === "click").length;
		const totalOrders = orders.length;

		const avgOrderValue = totalRevenue / Math.max(totalOrders, 1);
		const overallConversionRate = totalOrders / Math.max(totalClicks, 1);

		return {
			totalRevenue,
			totalClicks,
			totalOrders,
			avgOrderValue,
			overallConversionRate,
		};
	}

	// Fallback when we do not yet have per-event / per-order analytics. In this
	// case we aggregate directly from Whop's tracking link summaries so widgets
	// still show real data from the creator dashboard (never placeholders).
	const totalRevenue = links.reduce(
		(sum, link) => sum + (link.revenueGenerated ?? 0),
		0,
	);
	const totalClicks = links.reduce((sum, link) => sum + (link.clicks ?? 0), 0);
	const totalOrders = links.reduce(
		(sum, link) => sum + (link.convertedUsers ?? 0),
		0,
	);

	const avgOrderValue = totalRevenue / Math.max(totalOrders, 1);
	const overallConversionRate = totalOrders / Math.max(totalClicks || 1, 1);

	return {
		totalRevenue,
		totalClicks,
		totalOrders,
		avgOrderValue,
		overallConversionRate,
	};
}

export function getSourceMetrics(
	links: TrackingLink[],
	events: VisitorEvent[],
	orders: Order[],
): SourceMetrics[] {
	const linkById = new Map<string, TrackingLink>();
	for (const link of links) {
		linkById.set(link.id, link);
	}

	const clicksBySource = new Map<string, number>();
	const ordersBySource = new Map<string, { count: number; revenue: number }>();

	for (const ev of events) {
		if (ev.type !== "click") continue;
		const link = linkById.get(ev.linkId);
		const source = link?.utmSource ?? "unknown";
		clicksBySource.set(source, (clicksBySource.get(source) ?? 0) + 1);
	}

	for (const order of orders) {
		const link = linkById.get(order.linkId);
		const source = link?.utmSource ?? "unknown";
		const existing = ordersBySource.get(source) ?? {
			count: 0,
			revenue: 0,
		};
		existing.count += 1;
		existing.revenue += order.amount;
		ordersBySource.set(source, existing);
	}

	const sources = new Set<string>([
		...Array.from(clicksBySource.keys()),
		...Array.from(ordersBySource.keys()),
	]);

	const result: SourceMetrics[] = [];
	for (const source of sources) {
		const clicks = clicksBySource.get(source) ?? 0;
		const orderBucket = ordersBySource.get(source) ?? { count: 0, revenue: 0 };
		result.push({
			utmSource: source,
			clicks,
			orders: orderBucket.count,
			revenue: orderBucket.revenue,
		});
	}

	return result.sort((a, b) => b.revenue - a.revenue);
}

export function getCampaignMetrics(
	links: TrackingLink[],
	events: VisitorEvent[],
	orders: Order[],
): CampaignMetrics[] {
	const linkById = new Map<string, TrackingLink>();
	for (const link of links) {
		linkById.set(link.id, link);
	}

	const clicksByCampaign = new Map<string, number>();
	const ordersByCampaign = new Map<string, { count: number; revenue: number }>();

	for (const ev of events) {
		if (ev.type !== "click") continue;
		const link = linkById.get(ev.linkId);
		const campaign = link?.utmCampaign ?? "unknown";
		clicksByCampaign.set(campaign, (clicksByCampaign.get(campaign) ?? 0) + 1);
	}

	for (const order of orders) {
		const link = linkById.get(order.linkId);
		const campaign = link?.utmCampaign ?? "unknown";
		const existing = ordersByCampaign.get(campaign) ?? {
			count: 0,
			revenue: 0,
		};
		existing.count += 1;
		existing.revenue += order.amount;
		ordersByCampaign.set(campaign, existing);
	}

	const campaigns = new Set<string>([
		...Array.from(clicksByCampaign.keys()),
		...Array.from(ordersByCampaign.keys()),
	]);

	const result: CampaignMetrics[] = [];
	for (const campaign of campaigns) {
		const clicks = clicksByCampaign.get(campaign) ?? 0;
		const orderBucket = ordersByCampaign.get(campaign) ?? { count: 0, revenue: 0 };
		result.push({
			utmCampaign: campaign,
			clicks,
			orders: orderBucket.count,
			revenue: orderBucket.revenue,
			conversionRate: orderBucket.count / Math.max(clicks, 1),
		});
	}

	return result.sort((a, b) => b.revenue - a.revenue);
}
