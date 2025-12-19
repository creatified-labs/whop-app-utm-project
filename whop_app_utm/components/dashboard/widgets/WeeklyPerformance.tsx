"use client";

import { useEffect, useState, useMemo } from "react";
import { SparklineChart } from "@/components/dashboard/SparklineChart";
import { useUtmData } from "@/lib/utm/hooks";
import { getOverviewMetrics } from "@/lib/utm/metrics";

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface WeeklyPerformanceProps {
	size?: ModuleSize;
}

export function WeeklyPerformance({ size = "2x1" }: WeeklyPerformanceProps) {
	const { links, events, orders } = useUtmData();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (links.length >= 0 && events.length >= 0 && orders.length >= 0) {
			setLoading(false);
		}
	}, [links, events, orders]);

	// Filter data for last 7 days
	const { filteredEvents, filteredOrders, sparklineData } = useMemo(() => {
		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		const filteredEvents = events.filter((event) => {
			const eventDate = new Date(event.occurredAt);
			return eventDate >= sevenDaysAgo;
		});

		const filteredOrders = orders.filter((order) => {
			const orderDate = new Date(order.createdAt);
			return orderDate >= sevenDaysAgo;
		});

		// Generate sparkline data from orders
		const ordersByDate = new Map<string, number>();
		filteredOrders.forEach((order) => {
			const date = new Date(order.createdAt).toISOString().split("T")[0];
			ordersByDate.set(date, (ordersByDate.get(date) || 0) + order.amount);
		});

		const sparklineData = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
				.toISOString()
				.split("T")[0];
			const value = ordersByDate.get(date) || 0;
			sparklineData.push({ date, value });
		}

		return { filteredEvents, filteredOrders, sparklineData };
	}, [events, orders]);

	// Calculate metrics
	const metrics = useMemo(
		() => getOverviewMetrics(links, filteredEvents, filteredOrders),
		[links, filteredEvents, filteredOrders]
	);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	// Check if there's any data
	const hasData = metrics.totalClicks > 0 || metrics.totalOrders > 0 || metrics.totalRevenue > 0;

	if (!hasData) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center">
					<div className="text-sm text-muted-foreground">No data this week</div>
					<div className="text-xs text-muted-foreground/60 mt-1">
						Weekly metrics will appear as your links get activity
					</div>
				</div>
			</div>
		);
	}

	// Adjust layout based on size
	const isCompact = size === "1x1";
	const chartHeight = isCompact ? 40 : 50;

	return (
		<div className="h-full flex flex-col overflow-hidden p-1">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
				Last 7 Days
			</div>

			<div className={`grid grid-cols-4 gap-2 ${isCompact ? 'mb-2' : 'mb-3'} flex-shrink-0`}>
				<div>
					<div className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-emerald-400`}>
						${metrics.totalRevenue.toFixed(0)}
					</div>
					<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
						Revenue
					</div>
				</div>
				<div>
					<div className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-foreground`}>
						{metrics.totalClicks.toLocaleString()}
					</div>
					<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
						Clicks
					</div>
				</div>
				<div>
					<div className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-foreground`}>
						{metrics.totalOrders}
					</div>
					<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
						Orders
					</div>
				</div>
				<div>
					<div className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-foreground`}>
						{(metrics.overallConversionRate * 100).toFixed(1)}%
					</div>
					<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
						CVR
					</div>
				</div>
			</div>

			<div className="flex-1 min-h-0 flex items-end">
				<div className="w-full" style={{ height: `${chartHeight}px` }}>
					<SparklineChart data={sparklineData} height={chartHeight} color="#10b981" />
				</div>
			</div>
		</div>
	);
}
