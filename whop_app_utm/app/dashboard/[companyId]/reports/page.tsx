"use client";

import { useState, useEffect } from "react";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import {
	DashboardCard,
	DashboardCardHeader,
	DashboardCardBody,
} from "@/components/ui/DashboardCard";
import { ReportsPerformanceChart } from "@/components/reports/ReportsPerformanceChart";
import { ReportsCampaignTable } from "@/components/reports/ReportsCampaignTable";
import { Download, Calendar } from "lucide-react";

type DateRange = "7d" | "30d" | "90d" | "custom";

export default function ReportsPage() {
	const [dateRange, setDateRange] = useState<DateRange>("30d");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [sourceFilter, setSourceFilter] = useState<string>("");
	const [campaignFilter, setCampaignFilter] = useState<string>("");
	const [minRevenue, setMinRevenue] = useState<string>("");
	const [showFilters, setShowFilters] = useState(false);

	// Calculate date range
	useEffect(() => {
		const now = new Date();
		const end = now.toISOString().split("T")[0];
		let start = "";

		switch (dateRange) {
			case "7d":
				start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
				break;
			case "30d":
				start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
				break;
			case "90d":
				start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
				break;
			case "custom":
				// Keep existing custom dates
				return;
		}

		setStartDate(start);
		setEndDate(end);
	}, [dateRange]);

	const handleExport = async (reportType: "source" | "campaign" | "full") => {
		const params = new URLSearchParams();
		if (startDate) params.append("startDate", startDate);
		if (endDate) params.append("endDate", endDate);
		params.append("reportType", reportType);

		const url = `/api/reports/export?${params.toString()}`;
		window.open(url, "_blank");
	};

	return (
		<div className="px-6 sm:px-10 lg:px-16">
			<DashboardTopBar
				title="Reports"
				subtitle="High-level performance reports for your tracking links"
			/>

			{/* Date Range Selector */}
			<div className="mt-3 mb-4">
				<DashboardCard className="p-4">
					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setDateRange("7d")}
								className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === "7d"
										? "bg-blue-500 text-white"
										: "bg-white/5 text-foreground hover:bg-white/10"
									}`}
							>
								Last 7 days
							</button>
							<button
								onClick={() => setDateRange("30d")}
								className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === "30d"
										? "bg-blue-500 text-white"
										: "bg-white/5 text-foreground hover:bg-white/10"
									}`}
							>
								Last 30 days
							</button>
							<button
								onClick={() => setDateRange("90d")}
								className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === "90d"
										? "bg-blue-500 text-white"
										: "bg-white/5 text-foreground hover:bg-white/10"
									}`}
							>
								Last 90 days
							</button>
							<button
								onClick={() => setDateRange("custom")}
								className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateRange === "custom"
										? "bg-blue-500 text-white"
										: "bg-white/5 text-foreground hover:bg-white/10"
									}`}
							>
								<Calendar className="h-3 w-3 inline mr-1" />
								Custom
							</button>
						</div>

						<div className="flex gap-2">
							<button
								onClick={() => setShowFilters(!showFilters)}
								className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-foreground hover:bg-white/10 transition-colors"
							>
								{showFilters ? "Hide" : "Show"} Filters
							</button>
							<button
								onClick={() => handleExport("full")}
								className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1.5"
							>
								<Download className="h-3 w-3" />
								Export CSV
							</button>
						</div>
					</div>

					{dateRange === "custom" && (
						<div className="mt-4 flex gap-3">
							<div className="flex-1">
								<label className="block text-xs font-medium text-muted-foreground mb-1">
									Start Date
								</label>
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="flex-1">
								<label className="block text-xs font-medium text-muted-foreground mb-1">
									End Date
								</label>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>
					)}

					{showFilters && (
						<div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div>
								<label className="block text-xs font-medium text-muted-foreground mb-1">
									Filter by Source
								</label>
								<input
									type="text"
									value={sourceFilter}
									onChange={(e) => setSourceFilter(e.target.value)}
									placeholder="e.g., tiktok"
									className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-muted-foreground mb-1">
									Filter by Campaign
								</label>
								<input
									type="text"
									value={campaignFilter}
									onChange={(e) => setCampaignFilter(e.target.value)}
									placeholder="e.g., summer-sale"
									className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-muted-foreground mb-1">
									Min Revenue ($)
								</label>
								<input
									type="number"
									value={minRevenue}
									onChange={(e) => setMinRevenue(e.target.value)}
									placeholder="0"
									className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>
					)}
				</DashboardCard>
			</div>

			<div className="mt-3 space-y-4">
				{/* Revenue Over Time Chart */}
				<ReportsPerformanceChart
					startDate={startDate}
					endDate={endDate}
					granularity={dateRange === "7d" ? "day" : dateRange === "90d" ? "week" : "day"}
				/>

				{/* Campaign Breakdown Table */}
				<ReportsCampaignTable
					startDate={startDate}
					endDate={endDate}
					sourceFilter={sourceFilter}
					campaignFilter={campaignFilter}
					minRevenue={minRevenue ? parseFloat(minRevenue) : 0}
					onExport={handleExport}
				/>
			</div>
		</div>
	);
}
