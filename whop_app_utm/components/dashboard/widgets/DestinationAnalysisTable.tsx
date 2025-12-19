"use client";

import { useEffect, useState } from "react";
import { WidgetTable, type TableRow } from "@/components/dashboard/WidgetTable";

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface DestinationData {
	destination: string;
	clicks: number;
	orders: number;
	revenue: number;
	conversionRate: number;
}

interface DestinationAnalysisTableProps {
	size?: ModuleSize;
	selectedDestination?: string;
	sortBy?: "clicks" | "orders" | "revenue" | "cvr";
	sortOrder?: "asc" | "desc";
	timePeriod?: string;
}

function getStartDate(timePeriod?: string): string {
	const now = new Date();
	let days = 30;

	if (timePeriod === "7D" || timePeriod === "Last 7 Days") {
		days = 7;
	} else if (timePeriod === "30D" || timePeriod === "Last 30 Days") {
		days = 30;
	} else if (timePeriod === "90D" || timePeriod === "Last 90 Days") {
		days = 90;
	}

	const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
	return startDate.toISOString();
}

// Truncate URL for display
function truncateUrl(url: string, maxLength: number = 30): string {
	if (url.length <= maxLength) return url;
	return url.substring(0, maxLength) + "...";
}

export function DestinationAnalysisTable({
	size = "2x2",
	selectedDestination,
	sortBy = "revenue",
	sortOrder = "desc",
	timePeriod = "30D",
}: DestinationAnalysisTableProps) {
	const [data, setData] = useState<DestinationData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch(
					`/api/reports/destination-breakdown?startDate=${getStartDate(timePeriod)}&endDate=${new Date().toISOString()}`
				);
				const json = await res.json();
				const destinations = json.breakdown || [];

				// Filter out "No destinations yet" placeholder
				const filtered = destinations.filter(
					(d: DestinationData) => d.destination && d.destination !== "No destinations yet"
				);

				setData(filtered);
			} catch (error) {
				console.error("Failed to fetch destination data:", error);
				setData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [timePeriod]);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	const filteredData = selectedDestination
		? data.filter((d) => d.destination === selectedDestination)
		: data;

	// Determine max rows based on widget size
	const maxRows = size === "2x2" ? 5 : size === "2x1" ? 3 : 1;

	// Convert to table rows format, truncating destination URLs
	const tableRows: TableRow[] = filteredData.map((d) => ({
		label: truncateUrl(d.destination, size === "2x2" ? 40 : 25),
		clicks: d.clicks,
		orders: d.orders,
		revenue: d.revenue,
		cvr: d.conversionRate,
	}));

	if (tableRows.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-center p-4">
				<div className="text-sm font-medium text-foreground">No destinations yet</div>
				<div className="text-xs text-muted-foreground mt-1">
					Destination data will appear here once you have tracking links
				</div>
			</div>
		);
	}

	return (
		<WidgetTable
			rows={tableRows}
			maxRows={maxRows}
			sortBy={sortBy}
			sortOrder={sortOrder}
			showProgressBars={size === "2x2"}
		/>
	);
}
