"use client";

import { useEffect, useState, useMemo } from "react";
import * as Separator from "@radix-ui/react-separator";
import { SparklineChart } from "@/components/dashboard/SparklineChart";
import { useUtmData } from "@/lib/utm/hooks";
import { getOverviewMetrics } from "@/lib/utm/metrics";
import type { VisitorEvent, Order } from "@/lib/utm/types";

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface RevenueOverviewProps {
	size?: ModuleSize;
	timePeriod?: string;
}

// Helper function to filter events and orders by time period
function filterByTimePeriod(
	events: VisitorEvent[],
	orders: Order[],
	timePeriod?: string
): { filteredEvents: VisitorEvent[]; filteredOrders: Order[] } {
	if (!timePeriod || timePeriod === "All Time" || timePeriod === "All") {
		return { filteredEvents: events, filteredOrders: orders };
	}

	const now = new Date();
	let cutoffDate: Date;

	switch (timePeriod) {
		case "Last 7 Days":
		case "7D":
			cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case "Last 30 Days":
		case "30D":
			cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			break;
		case "Last 90 Days":
		case "90D":
			cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
			break;
		default:
			return { filteredEvents: events, filteredOrders: orders };
	}

	const filteredEvents = events.filter((event) => {
		const eventDate = new Date(event.occurredAt);
		return eventDate >= cutoffDate;
	});

	const filteredOrders = orders.filter((order) => {
		const orderDate = new Date(order.createdAt);
		return orderDate >= cutoffDate;
	});

	return { filteredEvents, filteredOrders };
}

export function RevenueOverview({ size = "2x1", timePeriod = "30D" }: RevenueOverviewProps) {
	const { links, events, orders } = useUtmData();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (links.length >= 0 && events.length >= 0 && orders.length >= 0) {
			setLoading(false);
		}
	}, [links, events, orders]);

	// Filter data by time period
	const { filteredEvents, filteredOrders } = useMemo(
		() => filterByTimePeriod(events, orders, timePeriod),
		[events, orders, timePeriod]
	);

	// Calculate metrics
	const metrics = useMemo(
		() => getOverviewMetrics(links, filteredEvents, filteredOrders),
		[links, filteredEvents, filteredOrders]
	);

	// Generate sparkline data from orders over time
	const sparklineData = useMemo(() => {
		if (filteredOrders.length === 0) return [];

		// Group orders by date
		const ordersByDate = new Map<string, number>();
		filteredOrders.forEach((order) => {
			const date = new Date(order.createdAt).toISOString().split("T")[0];
			ordersByDate.set(date, (ordersByDate.get(date) || 0) + order.amount);
		});

		// Convert to array and sort by date
		const sorted = Array.from(ordersByDate.entries())
			.sort((a, b) => a[0].localeCompare(b[0]))
			.map(([date, value]) => ({ date, value }));

		// If less than 7 data points, fill in zeros
		if (sorted.length < 7) {
			const days = timePeriod === "7D" ? 7 : timePeriod === "30D" ? 30 : 90;
			const filledData = [];
			for (let i = days - 1; i >= 0; i--) {
				const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
					.toISOString()
					.split("T")[0];
				const existing = sorted.find((d) => d.date === date);
				filledData.push({ date, value: existing?.value || 0 });
			}
			return filledData.slice(-20); // Last 20 points for sparkline
		}

		return sorted.slice(-20); // Last 20 points for sparkline
	}, [filteredOrders, timePeriod]);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	// Compact view (1x1)
	if (size === "1x1") {
		return (
			<div className="h-full flex flex-col">
				<div className="text-2xl font-bold text-foreground">
					${metrics.totalRevenue.toLocaleString()}
				</div>
				<div className="text-[11px] text-muted-foreground mt-1">
					{metrics.totalOrders} orders
				</div>
				<div className="mt-auto pt-2">
					<SparklineChart data={sparklineData} height={40} color="#10b981" />
				</div>
			</div>
		);
	}

	// Expanded view (2x1)
	return (
		<div className="h-full flex flex-col">
			<div className="space-y-3">
				<div>
					<div className="text-3xl font-bold text-foreground">
						${metrics.totalRevenue.toLocaleString()}
					</div>
					<div className="text-[11px] text-muted-foreground mt-1">
						{metrics.totalOrders} orders · {metrics.totalClicks} clicks
					</div>
				</div>

				<Separator.Root
				orientation="horizontal"
				className="bg-white/5 h-px w-full my-3"
			/>
			<div className="grid grid-cols-4 gap-3">
					<div>
						<div className="text-lg font-bold text-foreground">
							{metrics.totalClicks.toLocaleString()}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							Clicks
						</div>
					</div>
					<div>
						<div className="text-lg font-bold text-foreground">
							{metrics.totalOrders}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							Orders
						</div>
					</div>
					<div>
						<div className="text-lg font-bold text-emerald-400">
							${metrics.avgOrderValue.toFixed(2)}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							AOV
						</div>
					</div>
					<div>
						<div className="text-lg font-bold text-foreground">
							{(metrics.overallConversionRate * 100).toFixed(1)}%
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							CVR
						</div>
					</div>
				</div>
			</div>

			<div className="mt-auto pt-3">
				<SparklineChart data={sparklineData} height={64} color="#10b981" />
			</div>
		</div>
	);
}
