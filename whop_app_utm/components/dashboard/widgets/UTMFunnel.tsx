"use client";

import { useEffect, useState, useMemo } from "react";
import * as Separator from "@radix-ui/react-separator";
import { ArrowRight } from "lucide-react";

interface FunnelData {
	totalClicks: number;
	totalOrders: number;
	conversionRate: number;
	topCampaign: string;
	topSource: string;
	topMedium: string;
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface UTMFunnelProps {
	size?: ModuleSize;
}

export function UTMFunnel({ size }: UTMFunnelProps = {}) {
	const [data, setData] = useState<FunnelData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch campaign and source data
				const [campaignRes, sourceRes] = await Promise.all([
					fetch("/api/reports/campaign-breakdown?startDate=2024-01-01&endDate=" + new Date().toISOString()),
					fetch("/api/reports/source-breakdown?startDate=2024-01-01&endDate=" + new Date().toISOString()),
				]);

				const campaignData = await campaignRes.json();
				const sourceData = await sourceRes.json();

				const campaigns = campaignData.breakdown || [];
				const sources = sourceData.breakdown || [];

				// Get top performers
				const topCampaign = campaigns.sort((a: any, b: any) => b.revenue - a.revenue)[0]?.campaign || "None";
				const topSource = sources.sort((a: any, b: any) => b.revenue - a.revenue)[0]?.utmSource || "None";

				// Calculate totals
				const totalClicks = campaigns.reduce((sum: number, c: any) => sum + c.clicks, 0);
				const totalOrders = campaigns.reduce((sum: number, c: any) => sum + c.orders, 0);
				const conversionRate = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;

				setData({
					totalClicks,
					totalOrders,
					conversionRate,
					topCampaign,
					topSource,
					topMedium: "cpc", // Default for now
				});
			} catch (error) {
				console.error("Failed to fetch funnel data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">No funnel data yet</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-4">
				Attribution Flow
			</div>

			{/* Funnel visualization */}
			<div className="flex-1 flex flex-col justify-center space-y-4">
				{/* Campaign */}
				<div className="flex items-center justify-between">
					<div className="flex-1 space-y-1">
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							Campaign
						</div>
						<div className="text-sm font-semibold text-foreground truncate">
							{data.topCampaign}
						</div>
					</div>
					<ArrowRight className="h-4 w-4 text-muted-foreground mx-3" />
				</div>

				{/* Source */}
				<div className="flex items-center justify-between">
					<div className="flex-1 space-y-1">
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							Source
						</div>
						<div className="text-sm font-semibold text-foreground truncate">
							{data.topSource}
						</div>
					</div>
					<ArrowRight className="h-4 w-4 text-muted-foreground mx-3" />
				</div>

				{/* Medium */}
				<div className="flex items-center justify-between">
					<div className="flex-1 space-y-1">
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							Medium
						</div>
						<div className="text-sm font-semibold text-foreground truncate">
							{data.topMedium}
						</div>
					</div>
					<ArrowRight className="h-4 w-4 text-muted-foreground mx-3" />
				</div>

				{/* Conversion */}
				<div className="flex-1 space-y-1">
					<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
						Conversion
					</div>
					<div className="text-sm font-semibold text-emerald-400">
						{data.totalOrders} orders ({data.conversionRate.toFixed(1)}%)
					</div>
				</div>
			</div>

			{/* Summary */}
			<div className="mt-auto pt-4">
				<Separator.Root
					orientation="horizontal"
					className="bg-white/10 h-px w-full mb-4"
				/>
				<div className="grid grid-cols-3 gap-3">
					<div>
						<div className="text-lg font-bold text-foreground">
							{data.totalClicks.toLocaleString()}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							Clicks
						</div>
					</div>
					<div>
						<div className="text-lg font-bold text-foreground">{data.totalOrders}</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							Orders
						</div>
					</div>
					<div>
						<div className="text-lg font-bold text-blue-400">
							{data.conversionRate.toFixed(1)}%
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
							CVR
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
