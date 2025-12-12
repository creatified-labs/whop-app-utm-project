"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@whop/react/components";
import { ArrowUpDown, Download } from "lucide-react";

type CampaignData = {
	campaign: string;
	clicks: number;
	orders: number;
	revenue: number;
	conversionRate: number;
};

type SourceData = {
	source: string;
	clicks: number;
	orders: number;
	revenue: number;
	conversionRate: number;
};

type SortField = "campaign" | "clicks" | "orders" | "revenue" | "conversionRate";
type SortDirection = "asc" | "desc";

type Props = {
	startDate: string;
	endDate: string;
	sourceFilter: string;
	campaignFilter: string;
	minRevenue: number;
	onExport: (reportType: "source" | "campaign" | "full") => void;
};

export function ReportsCampaignTable({
	startDate,
	endDate,
	sourceFilter,
	campaignFilter,
	minRevenue,
	onExport,
}: Props) {
	const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
	const [sources, setSources] = useState<SourceData[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortField, setSortField] = useState<SortField>("revenue");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [activeTab, setActiveTab] = useState<"campaigns" | "sources">("campaigns");

	useEffect(() => {
		async function loadData() {
			if (!startDate || !endDate) return;

			setLoading(true);
			try {
				const params = new URLSearchParams();
				params.append("startDate", startDate);
				params.append("endDate", endDate);

				const [campaignRes, sourceRes] = await Promise.all([
					fetch(`/api/reports/campaign-breakdown?${params.toString()}`),
					fetch(`/api/reports/source-breakdown?${params.toString()}`),
				]);

				if (campaignRes.ok) {
					const json = await campaignRes.json();
					setCampaigns(json.breakdown || []);
				}

				if (sourceRes.ok) {
					const json = await sourceRes.json();
					setSources(json.breakdown || []);
				}
			} catch (error) {
				console.error("[ReportsCampaignTable] Failed to load:", error);
			} finally {
				setLoading(false);
			}
		}

		void loadData();
	}, [startDate, endDate]);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("desc");
		}
	};

	// Filter and sort data
	const filteredCampaigns = campaigns
		.filter((c) => {
			if (campaignFilter && !c.campaign.toLowerCase().includes(campaignFilter.toLowerCase())) {
				return false;
			}
			if (minRevenue > 0 && c.revenue < minRevenue) {
				return false;
			}
			return true;
		})
		.sort((a, b) => {
			const aVal = a[sortField];
			const bVal = b[sortField];
			const multiplier = sortDirection === "asc" ? 1 : -1;
			return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * multiplier;
		});

	const filteredSources = sources
		.filter((s) => {
			if (sourceFilter && !s.source.toLowerCase().includes(sourceFilter.toLowerCase())) {
				return false;
			}
			if (minRevenue > 0 && s.revenue < minRevenue) {
				return false;
			}
			return true;
		})
		.sort((a, b) => {
			const aVal = a[sortField as keyof SourceData];
			const bVal = b[sortField as keyof SourceData];
			const multiplier = sortDirection === "asc" ? 1 : -1;
			return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * multiplier;
		});

	const displayData = activeTab === "campaigns" ? filteredCampaigns : filteredSources;
	return (
		<Card
			size="3"
			variant="surface"
			className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-5 lg:p-6 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01] flex flex-col gap-4"
		>
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="text-sm font-semibold text-white tracking-tight">
						UTM Performance Breakdown
					</h2>
					<p className="text-xs text-slate-400 mt-1">
						{activeTab === "campaigns" ? "Campaign" : "Source"} performance with real-time data.
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => onExport(activeTab === "campaigns" ? "campaign" : "source")}
						className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors flex items-center gap-1.5"
					>
						<Download className="h-3 w-3" />
						Export
					</button>
				</div>
			</div>

			<div className="flex gap-2 border-b border-white/10">
				<button
					onClick={() => setActiveTab("campaigns")}
					className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === "campaigns"
							? "text-white border-b-2 border-blue-500"
							: "text-slate-400 hover:text-white"
						}`}
				>
					Campaigns
				</button>
				<button
					onClick={() => setActiveTab("sources")}
					className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === "sources"
							? "text-white border-b-2 border-blue-500"
							: "text-slate-400 hover:text-white"
						}`}
				>
					Sources
				</button>
			</div>

			<div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card/95">
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead>
							<tr className="text-xs uppercase tracking-wide text-slate-400 bg-white/5">
								<th className="px-4 py-3 text-left font-medium">
									<button
										onClick={() => handleSort("campaign")}
										className="flex items-center gap-1 hover:text-white transition-colors"
									>
										{activeTab === "campaigns" ? "Campaign" : "Source"}
										<ArrowUpDown className="h-3 w-3" />
									</button>
								</th>
								<th className="px-4 py-3 text-right font-medium">
									<button
										onClick={() => handleSort("clicks")}
										className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
									>
										Clicks
										<ArrowUpDown className="h-3 w-3" />
									</button>
								</th>
								<th className="px-4 py-3 text-right font-medium">
									<button
										onClick={() => handleSort("orders")}
										className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
									>
										Orders
										<ArrowUpDown className="h-3 w-3" />
									</button>
								</th>
								<th className="px-4 py-3 text-right font-medium">
									<button
										onClick={() => handleSort("conversionRate")}
										className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
									>
										Conv. Rate
										<ArrowUpDown className="h-3 w-3" />
									</button>
								</th>
								<th className="px-4 py-3 text-right font-medium">
									<button
										onClick={() => handleSort("revenue")}
										className="flex items-center gap-1 ml-auto hover:text-white transition-colors"
									>
										Revenue
										<ArrowUpDown className="h-3 w-3" />
									</button>
								</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
										Loading data...
									</td>
								</tr>
							) : displayData.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
										No data available for selected filters.
									</td>
								</tr>
							) : (
								displayData.map((row, index) => {
									const name = "campaign" in row ? row.campaign : row.source;
									return (
										<tr
											key={name}
											className={`border-t border-white/5 ${index % 2 === 0 ? "bg-slate-950/20" : "bg-slate-950/10"
												} hover:bg-white/10 transition-colors duration-150`}
										>
											<td className="px-4 py-3 text-left text-slate-100 font-medium">
												{name}
											</td>
											<td className="px-4 py-3 text-right text-slate-100">
												{row.clicks.toLocaleString()}
											</td>
											<td className="px-4 py-3 text-right text-slate-100">
												{row.orders.toLocaleString()}
											</td>
											<td className="px-4 py-3 text-right text-emerald-300">
												{row.conversionRate.toFixed(2)}%
											</td>
											<td className="px-4 py-3 text-right text-slate-100">
												${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</Card>
	);
}
