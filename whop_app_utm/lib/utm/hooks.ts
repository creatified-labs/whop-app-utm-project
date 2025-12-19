"use client";

import { useEffect, useMemo, useState } from "react";
import { getLinkMetrics, getOverviewMetrics, getSourceMetrics, getCampaignMetrics } from "./metrics";
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

// TODO: In the future, replace MOCK_* imports with real Supabase/Whop queries.
// These hooks should remain the main public API for dashboard data access.

export function useUtmData(): {
	links: TrackingLink[];
	events: VisitorEvent[];
	orders: Order[];
} {
	const [links, setLinks] = useState<TrackingLink[]>([]);
	const [events, setEvents] = useState<VisitorEvent[]>([]);
	const [orders, setOrders] = useState<Order[]>([]);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				// Fetch both Whop tracking links and advanced links in parallel
				const [whopRes, advancedRes] = await Promise.all([
					fetch("/api/tracking-links"),
					fetch("/api/advanced-links-data"),
				]);

				const whopData = whopRes.ok
					? ((await whopRes.json()) as {
						links?: TrackingLink[];
						events?: VisitorEvent[];
						orders?: Order[];
					})
					: { links: [], events: [], orders: [] };

				const advancedData = advancedRes.ok
					? ((await advancedRes.json()) as {
						links?: TrackingLink[];
						events?: VisitorEvent[];
						orders?: Order[];
					})
					: { links: [], events: [], orders: [] };

				if (cancelled) return;

				// Merge data from both sources
				const allLinks = [
					...(Array.isArray(whopData.links) ? whopData.links : []),
					...(Array.isArray(advancedData.links) ? advancedData.links : []),
				];

				const allEvents = [
					...(Array.isArray(whopData.events) ? whopData.events : []),
					...(Array.isArray(advancedData.events) ? advancedData.events : []),
				];

				const allOrders = [
					...(Array.isArray(whopData.orders) ? whopData.orders : []),
					...(Array.isArray(advancedData.orders) ? advancedData.orders : []),
				];

				setLinks(allLinks);
				setEvents(allEvents);
				setOrders(allOrders);
			} catch (error) {
				console.error("[useUtmData] Failed to load data:", error);
				if (cancelled) return;
				setLinks([]);
				setEvents([]);
				setOrders([]);
			}
		}

		void load();

		return () => {
			cancelled = true;
		};
	}, []);

	return { links, events, orders };
}

export function useOverviewMetrics(): OverviewMetrics {
	const { links, events, orders } = useUtmData();

	return useMemo(
		() => getOverviewMetrics(links, events, orders),
		[links, events, orders],
	);
}

export function useLinkMetrics(): LinkMetrics[] {
	const { links, events, orders } = useUtmData();

	return useMemo(
		() => getLinkMetrics(links, events, orders),
		[links, events, orders],
	);
}

const DEFAULT_DATE_RANGE_DAYS = 30;

function buildDateParams(days: number) {
	const now = new Date();
	const endDate = now.toISOString().split("T")[0];
	const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0];
	const params = new URLSearchParams();
	params.append("startDate", startDate);
	params.append("endDate", endDate);
	return params.toString();
}

export function useSourceMetrics(rangeDays = DEFAULT_DATE_RANGE_DAYS): SourceMetrics[] {
	const [metrics, setMetrics] = useState<SourceMetrics[]>([]);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const query = buildDateParams(rangeDays);
				const res = await fetch(`/api/reports/source-breakdown?${query}`);
				if (!res.ok) throw new Error("Failed to fetch source breakdown");

				const data = (await res.json()) as { breakdown?: Array<{ source: string; clicks: number; orders: number; revenue: number }> };
				if (cancelled) return;

				const breakdown = Array.isArray(data.breakdown) ? data.breakdown : [];
				setMetrics(
					breakdown.map((row) => ({
						utmSource: row.source,
						clicks: row.clicks ?? 0,
						orders: row.orders ?? 0,
						revenue: row.revenue ?? 0,
					})),
				);
			} catch (error) {
				console.error("[useSourceMetrics] Failed to load source metrics", error);
				if (!cancelled) {
					setMetrics([]);
				}
			}
		}

		void load();

		return () => {
			cancelled = true;
		};
	}, [rangeDays]);

	return metrics;
}

export function useCampaignMetrics(rangeDays = DEFAULT_DATE_RANGE_DAYS): CampaignMetrics[] {
	const [metrics, setMetrics] = useState<CampaignMetrics[]>([]);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const query = buildDateParams(rangeDays);
				const res = await fetch(`/api/reports/campaign-breakdown?${query}`);
				if (!res.ok) throw new Error("Failed to fetch campaign breakdown");

				const data = (await res.json()) as { breakdown?: Array<{ campaign: string; clicks: number; orders: number; revenue: number; conversionRate: number }> };
				if (cancelled) return;

				const breakdown = Array.isArray(data.breakdown) ? data.breakdown : [];
				setMetrics(
					breakdown.map((row) => ({
						utmCampaign: row.campaign,
						clicks: row.clicks ?? 0,
						orders: row.orders ?? 0,
						revenue: row.revenue ?? 0,
						conversionRate: (row.conversionRate ?? 0) / 100,
					})),
				);
			} catch (error) {
				console.error("[useCampaignMetrics] Failed to load campaign metrics", error);
				if (!cancelled) {
					setMetrics([]);
				}
			}
		}

		void load();

		return () => {
			cancelled = true;
		};
	}, [rangeDays]);

	return metrics;
}

export function useDeviceMetrics(): DeviceMetrics[] {
	const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetrics[]>([]);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const res = await fetch("/api/device-metrics");
				if (!res.ok) throw new Error("Failed to load device metrics");

				const data = (await res.json()) as { metrics: DeviceMetrics[] };

				if (cancelled) return;

				if (Array.isArray(data.metrics)) {
					setDeviceMetrics(data.metrics);
				}
			} catch (error) {
				console.error("[useDeviceMetrics] Failed to load:", error);
				if (cancelled) return;
				setDeviceMetrics([]);
			}
		}

		void load();

		return () => {
			cancelled = true;
		};
	}, []);

	return deviceMetrics;
}
