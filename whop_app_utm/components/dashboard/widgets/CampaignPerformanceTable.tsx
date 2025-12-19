"use client";

import { useEffect, useState } from "react";
import { WidgetTable, type TableRow } from "@/components/dashboard/WidgetTable";

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface CampaignData {
	campaign: string;
	clicks: number;
	orders: number;
	revenue: number;
	conversionRate: number;
}

interface CampaignPerformanceTableProps {
	size?: ModuleSize;
	selectedCampaign?: string;
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

export function CampaignPerformanceTable({
	size = "2x2",
	selectedCampaign,
	sortBy = "revenue",
	sortOrder = "desc",
	timePeriod = "30D",
}: CampaignPerformanceTableProps) {
	const [data, setData] = useState<CampaignData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch(
					`/api/reports/campaign-breakdown?startDate=${getStartDate(timePeriod)}&endDate=${new Date().toISOString()}`
				);
				const json = await res.json();
				const campaigns = json.breakdown || [];

				// Filter out "No campaigns yet" placeholder
				const filtered = campaigns.filter(
					(c: CampaignData) => c.campaign && c.campaign !== "No campaigns yet"
				);

				setData(filtered);
			} catch (error) {
				console.error("Failed to fetch campaign data:", error);
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

	const filteredData = selectedCampaign
		? data.filter((d) => d.campaign === selectedCampaign)
		: data;

	// Determine max rows based on widget size
	const maxRows = size === "2x2" ? 5 : size === "2x1" ? 3 : 1;

	// Convert to table rows format
	const tableRows: TableRow[] = filteredData.map((d) => ({
		label: d.campaign,
		clicks: d.clicks,
		orders: d.orders,
		revenue: d.revenue,
		cvr: d.conversionRate,
	}));

	if (tableRows.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-center p-4">
				<div className="text-sm font-medium text-foreground">No campaigns yet</div>
				<div className="text-xs text-muted-foreground mt-1">
					Campaign data will appear here once you have tracking links with UTM campaigns
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
