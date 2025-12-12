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

export function useSourceMetrics(): SourceMetrics[] {
	const { links, events, orders } = useUtmData();

	return useMemo(
		() => getSourceMetrics(links, events, orders),
		[links, events, orders],
	);
}

export function useCampaignMetrics(): CampaignMetrics[] {
	const { links, events, orders } = useUtmData();

	return useMemo(
		() => getCampaignMetrics(links, events, orders),
		[links, events, orders],
	);
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
