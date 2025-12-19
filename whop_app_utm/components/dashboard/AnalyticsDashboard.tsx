"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@whop/react/components";
import {
	DashboardCard,
	DashboardCardHeader,
	DashboardCardBody,
} from "@/components/ui/DashboardCard";
import { useOverviewMetrics, useSourceMetrics, useCampaignMetrics } from "@/lib/utm/hooks";
import { DeviceBreakdownCard as DeviceCard } from "@/components/analytics/DeviceBreakdownCard";
import { GeoBreakdownCard as GeoCard } from "@/components/analytics/GeoBreakdownCard";

export function AnalyticsDashboard({ companyId }: { companyId?: string }) {
	const overviewMetrics = useOverviewMetrics();
	const sourceMetrics = useSourceMetrics();
	const campaignMetrics = useCampaignMetrics();

	return (
		<div className="space-y-6">
			{/* Top Metrics Grid - Real Data */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<MetricCard
					label="Total Clicks"
					value={overviewMetrics.totalClicks.toLocaleString()}
					subtitle="All tracking links"
				/>
				<MetricCard
					label="Total Revenue"
					value={`$${overviewMetrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
					subtitle="From tracked orders"
				/>
				<MetricCard
					label="Total Orders"
					value={overviewMetrics.totalOrders.toLocaleString()}
					subtitle="Converted purchases"
				/>
				<MetricCard
					label="Conversion Rate"
					value={`${(overviewMetrics.overallConversionRate * 100).toFixed(1)}%`}
					subtitle="Click to purchase"
				/>
			</div>

			{/* UTM Sources Performance */}
			<UTMSourcesChart sources={sourceMetrics} />

			{/* Secondary Metrics */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				<SmallStatCard
					label="Avg Order Value"
					value={`$${overviewMetrics.avgOrderValue.toFixed(2)}`}
					color="blue"
				/>
				<SmallStatCard
					label="Total Sources"
					value={sourceMetrics.length.toString()}
					color="purple"
				/>
				<SmallStatCard
					label="Active Campaigns"
					value={campaignMetrics.length.toString()}
					color="emerald"
				/>
				<SmallStatCard
					label="Best CVR"
					value={`${Math.max(0, ...campaignMetrics.map(c => c.conversionRate * 100)).toFixed(1)}%`}
					color="cyan"
				/>
			</div>

			{/* Device & Geo Analytics */}
			{companyId && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<DeviceCard companyId={companyId} />
					<GeoCard companyId={companyId} />
				</div>
			)}

			{/* UTM Campaigns and Sources Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				<div className="lg:col-span-6">
					<CampaignsList campaigns={campaignMetrics} />
				</div>
				<div className="lg:col-span-6">
					<SourcesList sources={sourceMetrics} />
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	label,
	value,
	subtitle,
}: {
	label: string;
	value: string;
	subtitle: string;
}) {
	return (
		<DashboardCard className="p-5">
			<div className="space-y-2">
				<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
					{label}
				</span>
				<div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
					{value}
				</div>
				<span className="text-xs text-muted-foreground">{subtitle}</span>
			</div>
		</DashboardCard>
	);
}

function UTMSourcesChart({ sources }: { sources: Array<{ utmSource: string; clicks: number; orders: number; revenue: number }> }) {
	const max = Math.max(...sources.map(s => s.revenue), 1);
	const topSources = sources.slice(0, 8);

	return (
		<DashboardCard className="p-6">
			<DashboardCardHeader>
				<div>
					<h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
						UTM Source Performance
					</h3>
					<p className="text-xs text-muted-foreground mt-1">Revenue by traffic source</p>
				</div>
				<Badge variant="soft" color="gray" className="text-[10px] px-2 py-0.5">
					{sources.length} sources
				</Badge>
			</DashboardCardHeader>

			<DashboardCardBody className="mt-4">
				{topSources.length > 0 ? (
					<>
						<div className="relative h-48 sm:h-56">
							<div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 sm:gap-2 h-full">
								{topSources.map((source, idx) => (
									<div key={idx} className="flex-1 flex items-end group relative">
										<div
											className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-300 hover:from-blue-600 hover:to-blue-500 cursor-pointer"
											style={{ height: `${(source.revenue / max) * 100}%`, minHeight: '8px' }}
											title={`${source.utmSource}: $${source.revenue.toFixed(2)}`}
										/>
										<div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
											${source.revenue.toFixed(0)}
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-medium overflow-x-auto">
							{topSources.map((source, idx) => (
								<span key={idx} className="flex-1 text-center truncate px-1">
									{source.utmSource}
								</span>
							))}
						</div>
					</>
				) : (
					<div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
						No UTM source data yet. Start tracking links to see performance!
					</div>
				)}
			</DashboardCardBody>
		</DashboardCard>
	);
}

function SmallStatCard({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color: "blue" | "purple" | "emerald" | "cyan";
}) {
	const colorClasses = {
		blue: "text-blue-600 dark:text-blue-400",
		purple: "text-purple-600 dark:text-purple-400",
		emerald: "text-emerald-600 dark:text-emerald-400",
		cyan: "text-cyan-600 dark:text-cyan-400",
	};

	return (
		<DashboardCard className="p-4 text-center">
			<div className={`text-xl font-semibold ${colorClasses[color]}`}>
				{value}
			</div>
			<div className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wide">
				{label}
			</div>
		</DashboardCard>
	);
}

function CampaignsList({ campaigns }: { campaigns: Array<{ utmCampaign: string; clicks: number; orders: number; revenue: number; conversionRate: number }> }) {
	const topCampaigns = campaigns.slice(0, 10);

	return (
		<DashboardCard className="p-5">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold tracking-tight text-foreground">
					UTM Campaigns
				</h3>
				<Badge variant="soft" color="gray" className="text-[10px] px-2 py-0.5">
					{campaigns.length} total
				</Badge>
			</div>

			<div className="space-y-3">
				{topCampaigns.length > 0 ? (
					topCampaigns.map((campaign, idx) => (
						<div
							key={idx}
							className="flex items-center gap-3 rounded-lg p-3 bg-accent/40 hover:bg-accent/60 transition-colors"
						>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-foreground truncate">
									{campaign.utmCampaign}
								</p>
								<div className="flex items-center gap-3 mt-1">
									<p className="text-[10px] text-muted-foreground">
										{campaign.clicks} clicks
									</p>
									<p className="text-[10px] text-muted-foreground">
										{campaign.orders} orders
									</p>
									<p className="text-[10px] text-muted-foreground">
										${campaign.revenue.toFixed(0)}
									</p>
								</div>
							</div>
							<div className="shrink-0">
								<div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center">
									<span className="text-xs font-semibold text-foreground">
										{(campaign.conversionRate * 100).toFixed(1)}%
									</span>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="text-center py-8 text-sm text-muted-foreground">
						No campaign data yet. Add utm_campaign to your tracking links!
					</div>
				)}
			</div>
		</DashboardCard>
	);
}

function SourcesList({ sources }: { sources: Array<{ utmSource: string; clicks: number; orders: number; revenue: number }> }) {
	const topSources = sources.slice(0, 10);
	const maxRevenue = Math.max(...topSources.map(s => s.revenue), 1);

	return (
		<DashboardCard className="p-6">
			<div className="flex items-center justify-between mb-5">
				<h3 className="text-base font-semibold tracking-tight text-foreground">
					UTM Sources
				</h3>
				<Badge variant="soft" color="gray" className="text-[10px] px-2 py-0.5">
					{sources.length} sources
				</Badge>
			</div>

			<div className="space-y-4">
				{topSources.length > 0 ? (
					topSources.map((source, idx) => {
						const colors = [
							"bg-blue-500",
							"bg-purple-500",
							"bg-cyan-600",
							"bg-emerald-500",
							"bg-orange-600",
						];
						const color = colors[idx % colors.length];

						return (
							<div key={idx} className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-2">
										<div className={`w-3 h-2 rounded-sm ${color}`} />
										<span className="font-medium text-foreground">
											{source.utmSource}
										</span>
									</div>
									<span className="font-semibold text-foreground tabular-nums">
										${source.revenue.toFixed(0)}
									</span>
								</div>
								<div className="h-2 rounded-full bg-accent overflow-hidden">
									<div
										className={`h-full rounded-full ${color}`}
										style={{
											width: `${(source.revenue / maxRevenue) * 100}%`,
										}}
									/>
								</div>
								<div className="flex items-center justify-between text-[10px] text-muted-foreground">
									<span>{source.clicks} clicks</span>
									<span>{source.orders} orders</span>
								</div>
							</div>
						);
					})
				) : (
					<div className="text-center py-8 text-sm text-muted-foreground">
						No source data yet. Add utm_source to your tracking links!
					</div>
				)}
			</div>
		</DashboardCard>
	);
}

export default AnalyticsDashboard;
