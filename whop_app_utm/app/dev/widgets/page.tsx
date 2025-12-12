"use client";

import { useState } from "react";
import { DashboardCard } from "@/components/ui/DashboardCard";
import {
	PoundSterling,
	TrendingUp,
	Users,
	ShoppingCart,
	type LucideIcon,
} from "lucide-react";
import { useOverviewMetrics } from "@/lib/utm/hooks";
import type { OverviewMetrics } from "@/lib/utm/types";

type MetricConfig = {
	title: string;
	value: number | string;
	valuePrefix: string;
	subtitle: string;
	trend?: number;
	icon: LucideIcon;
};

const METRIC_CONFIGS: Record<string, MetricConfig> = {
	MRR: {
		title: "MRR",
		value: 18920,
		valuePrefix: "$",
		subtitle: "Recurring revenue",
		trend: 6.3,
		icon: PoundSterling,
	},
	"Total Stats": {
		title: "Total Stats",
		value: 45250,
		valuePrefix: "$",
		subtitle: "From 127 entries",
		trend: 12.5,
		icon: TrendingUp,
	},
	Metric: {
		title: "Funnel Conversion",
		value: 10.4,
		valuePrefix: "",
		subtitle: "vs last month",
		trend: 12.5,
		icon: TrendingUp,
	},
	"Total Revenue": {
		title: "Total Revenue",
		value: 302410,
		valuePrefix: "$",
		subtitle: "Attributed revenue",
		trend: 8.2,
		icon: ShoppingCart,
	},
};

const DEFAULT_METRIC: MetricConfig = {
	title: "Metric",
	value: 0,
	valuePrefix: "",
	subtitle: "No data yet",
	trend: undefined as number | undefined,
	icon: Users,
};

type WidgetSize = "1x1" | "2x1" | "1x2" | "2x2";

function MetricCardContent({
	title,
	overview,
	size = "1x1",
}: {
	title: string;
	overview: OverviewMetrics;
	size?: WidgetSize;
}) {
	const config = METRIC_CONFIGS[title] ?? DEFAULT_METRIC;

	const totalRevenue = overview.totalRevenue;
	const totalClicks = overview.totalClicks;
	const totalOrders = overview.totalOrders;
	const avgOrderValue = overview.avgOrderValue;
	const overallConversionRate = overview.overallConversionRate * 100;

	const generateLineChartData = () => {
		const points = 20;
		const trend = config.trend ?? 0;

		const phaseOffset =
			title === "MRR" ? 0 : title === "Total Stats" ? 1 : title === "Metric" ? 2 : 3;

		return Array.from({ length: points }, (_, i) => {
			const x = (i / Math.max(points - 1, 1)) * Math.PI * 2 + phaseOffset;
			const wave = 0.3 * Math.sin(x);
			const trendFactor = (trend / 100) * (i / Math.max(points - 1, 1)) * 0.5;

			const value = 0.5 + wave + trendFactor;
			return Math.max(0.1, Math.min(0.9, value));
		});
	};

	const lineData = generateLineChartData();

	const renderLineChart = () => {
		const trendColor = (config.trend ?? 0) >= 0 ? "#3b82f6" : "#f87171";
		const width = 100;
		const height = 100;

		const points = lineData.map((value, i) => {
			const x = (i / (lineData.length - 1)) * width;
			const y = height - value * height;
			return `${x},${y}`;
		});

		const pathD = `M ${points.join(' L ')}`;
		const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

		return (
			<div className="h-16 w-full relative">
				<svg
					viewBox={`0 0 ${width} ${height}`}
					className="w-full h-full"
					preserveAspectRatio="none"
				>
					<path
						d={areaD}
						fill={trendColor}
						opacity="0.1"
					/>
					<path
						d={pathD}
						stroke={trendColor}
						strokeWidth="2"
						fill="none"
						opacity="0.8"
					/>
				</svg>
			</div>
		);
	};

	const isConversionMetric = config.title === "Funnel Conversion";
	const isMRR = config.title === "MRR";
	const isTotalStats = config.title === "Total Stats";
	const isRevenue = config.title === "Total Revenue";

	if (isMRR) {
		const formattedRevenue = totalRevenue.toLocaleString(undefined, {
			maximumFractionDigits: 0,
		});

		if (size === "2x2") {
			return (
				<div className="h-full flex flex-col overflow-hidden">
					<div className="space-y-3">
						<div className="flex items-baseline gap-2">
							<div className="text-5xl font-bold text-foreground leading-tight">
								${formattedRevenue}
							</div>
						</div>
						<div className="text-sm text-muted-foreground">
							Revenue from tracked links
						</div>
					</div>

					<div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
						<div>
							<div className="text-2xl font-bold text-foreground">
								{totalOrders.toLocaleString()}
							</div>
							<div className="text-xs text-muted-foreground mt-1">Orders</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-foreground">
								{totalClicks.toLocaleString()}
							</div>
							<div className="text-xs text-muted-foreground mt-1">Clicks</div>
						</div>
						<div>
							<div className="text-2xl font-bold text-emerald-400">
								${avgOrderValue.toFixed(2)}
							</div>
							<div className="text-xs text-muted-foreground mt-1">Avg Order</div>
						</div>
					</div>

					<div className="mt-auto pt-4">
						{renderLineChart()}
					</div>
				</div>
			);
		}

		if (size === "2x1" || size === "1x2") {
			return (
				<div className="h-full flex flex-col overflow-hidden">
					<div className="space-y-2">
						<div className="flex items-baseline gap-2">
							<div className="text-3xl font-bold text-foreground leading-tight">
								${formattedRevenue}
							</div>
						</div>
						<div className="text-xs text-muted-foreground">
							Revenue from tracked links
						</div>
						<div className="flex gap-4 pt-2 text-sm">
							<div>
								<span className="text-muted-foreground">Orders: </span>
								<span className="font-semibold text-foreground">{totalOrders.toLocaleString()}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Clicks: </span>
								<span className="font-semibold text-foreground">{totalClicks.toLocaleString()}</span>
							</div>
						</div>
					</div>

					<div className="mt-auto pt-3">
						{renderLineChart()}
					</div>
				</div>
			);
		}

		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="space-y-1.5">
					<div className="flex items-baseline gap-2">
						<div className="text-2xl sm:text-[32px] md:text-[34px] font-bold text-foreground leading-tight">
							${formattedRevenue}
						</div>
					</div>
					<div className="text-[11px] text-muted-foreground uppercase tracking-wide">
						Revenue from tracked links
					</div>
				</div>

				<div className="mt-auto pt-3">
					{renderLineChart()}
				</div>
			</div>
		);
	}

	if (isTotalStats) {
		const revenueLabel = totalRevenue.toLocaleString(undefined, {
			maximumFractionDigits: 0,
		});

		return (
			<div className="space-y-4 overflow-hidden">
				<div>
					<div className="text-2xl sm:text-3xl font-bold text-foreground">
						${revenueLabel}
					</div>
					<div className="mt-1 text-[11px] text-muted-foreground">
						{totalOrders.toLocaleString()} orders · {totalClicks.toLocaleString()} clicks
					</div>
				</div>

				<div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-white/5">
					<div>
						<div className="text-2xl font-bold text-foreground">
							{totalClicks.toLocaleString()}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
							Total clicks
						</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-foreground">
							{totalOrders.toLocaleString()}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
							Total orders
						</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-foreground">
							${avgOrderValue.toFixed(2)}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
							Avg order value
						</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-foreground">
							{overallConversionRate ? overallConversionRate.toFixed(1) : "0.0"}%
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
							Conversion rate
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isConversionMetric) {
		const conv = overallConversionRate || 0;

		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="flex-1 flex flex-col items-center justify-center pb-2">
					<div className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
						{conv.toFixed(1)}%
					</div>
					<div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide mt-2">
						Overall conversion rate
					</div>
				</div>

				<div className="mt-auto">
					{renderLineChart()}
				</div>
			</div>
		);
	}

	if (isRevenue) {
		const revenueLabel = totalRevenue.toLocaleString(undefined, {
			maximumFractionDigits: 0,
		});

		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="space-y-2">
					<div className="text-2xl sm:text-[30px] md:text-[32px] font-bold text-foreground leading-tight">
						${revenueLabel}
					</div>
					<div className="mt-1 text-[11px] text-muted-foreground">
						{totalOrders.toLocaleString()} orders · {totalClicks.toLocaleString()} clicks
					</div>

					<div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
						<div>
							<div className="text-xl font-bold text-emerald-400">
								${avgOrderValue.toFixed(2)}
							</div>
							<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
								Avg order value
							</div>
						</div>
						<div>
							<div className="text-xl font-bold text-foreground">
								{overallConversionRate ? overallConversionRate.toFixed(1) : "0.0"}%
							</div>
							<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
								Conversion rate
							</div>
						</div>
					</div>
				</div>

				<div className="mt-auto pt-3">
					{renderLineChart()}
				</div>
			</div>
		);
	}

	return null;
}

const WIDGET_TITLES = ["MRR", "Total Stats", "Metric", "Total Revenue"] as const;
const WIDGET_SIZES: WidgetSize[] = ["1x1", "2x1", "1x2", "2x2"];

const SIZE_LABELS: Record<WidgetSize, string> = {
	"1x1": "Square (1x1)",
	"2x1": "Wide (2x1)",
	"1x2": "Tall (1x2)",
	"2x2": "Large (2x2)",
};

export default function WidgetDevPage() {
	const overview = useOverviewMetrics();
	const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
	const [editMode, setEditMode] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "sizes">("sizes");

	if (process.env.NODE_ENV === "production") {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-4">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-foreground mb-2">404</h1>
					<p className="text-muted-foreground">Page not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-4 md:p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Widget Showcase</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Development-only page for managing and testing widgets
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1 bg-accent rounded-lg p-1">
							<button
								type="button"
								onClick={() => setViewMode("sizes")}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "sizes"
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
									}`}
							>
								Size View
							</button>
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "grid"
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
									}`}
							>
								Grid View
							</button>
						</div>
						<button
							type="button"
							onClick={() => setEditMode(!editMode)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${editMode
									? "bg-blue-500 text-white"
									: "bg-accent text-foreground hover:bg-accent/80"
								}`}
						>
							{editMode ? "View Mode" : "Edit Mode"}
						</button>
					</div>
				</div>

				<div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<div className="text-yellow-500 text-xl">⚠️</div>
						<div>
							<h3 className="font-semibold text-foreground">Development Only</h3>
							<p className="text-sm text-muted-foreground mt-1">
								This page is only accessible in development mode and will return a 404 in production.
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-8">
					{viewMode === "sizes" ? (
						<>
							{WIDGET_TITLES.map((title) => {
								const config = METRIC_CONFIGS[title] ?? DEFAULT_METRIC;
								const Icon = config.icon;

								return (
									<section key={title} className="space-y-4">
										<div className="flex items-center gap-3">
											<div className="p-2 rounded-lg bg-white/5 border border-white/10">
												<Icon className="h-5 w-5 text-foreground/80" />
											</div>
											<div>
												<h2 className="text-xl font-semibold text-foreground">{title}</h2>
												<p className="text-sm text-muted-foreground">{config.subtitle}</p>
											</div>
										</div>

										<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
											{WIDGET_SIZES.map((size) => {
												const isTall = size === "1x2" || size === "2x2";
												const heightClass = isTall ? "h-[400px]" : "h-[280px]";

												return (
													<div key={size} className="space-y-2">
														<div className="flex items-center justify-between">
															<h3 className="text-sm font-medium text-muted-foreground">
																{SIZE_LABELS[size]}
															</h3>
															<span className="text-xs text-muted-foreground/60">{size}</span>
														</div>
														<DashboardCard className={`${heightClass} flex flex-col relative p-4 sm:p-5`}>
															<div className="flex items-start justify-between mb-4">
																<div className="flex items-center gap-2.5">
																	<div className="p-2 rounded-lg bg-white/5 border border-white/10">
																		<Icon className="h-4 w-4 text-foreground/80" />
																	</div>
																	<div>
																		<h3 className="text-sm font-semibold text-foreground">
																			{title}
																		</h3>
																		<p className="text-[10px] text-muted-foreground mt-0.5">
																			{config.subtitle}
																		</p>
																	</div>
																</div>
															</div>

															<div className="flex-1 flex flex-col justify-center">
																<MetricCardContent title={title} overview={overview} size={size} />
															</div>

															<div className="pointer-events-none absolute inset-0">
																<div className="absolute bottom-0.5 right-0.5 w-3 h-3">
																	<div className="w-full h-full border-b-[3px] border-r-[2px] border-slate-400/80 rounded-br-full" />
																</div>
															</div>
														</DashboardCard>
													</div>
												);
											})}
										</div>
									</section>
								);
							})}
						</>
					) : (
						<section>
							<h2 className="text-xl font-semibold text-foreground mb-4">All Widgets</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{WIDGET_TITLES.map((title) => {
									const config = METRIC_CONFIGS[title] ?? DEFAULT_METRIC;
									const Icon = config.icon;
									const isSelected = selectedWidget === title;

									return (
										<div
											key={title}
											className={`relative transition-all ${isSelected ? "ring-2 ring-blue-500" : ""
												}`}
										>
											<DashboardCard className="h-[280px] flex flex-col relative p-4 sm:p-5">
												<div className="flex items-start justify-between mb-4">
													<div className="flex items-center gap-2.5">
														<div className="p-2 rounded-lg bg-white/5 border border-white/10">
															<Icon className="h-4 w-4 text-foreground/80" />
														</div>
														<div>
															<h3 className="text-sm font-semibold text-foreground">
																{title}
															</h3>
															<p className="text-[10px] text-muted-foreground mt-0.5">
																{config.subtitle}
															</p>
														</div>
													</div>
													{editMode && (
														<button
															type="button"
															onClick={() => setSelectedWidget(isSelected ? null : title)}
															className="h-7 w-7 flex items-center justify-center text-[11px] text-muted-foreground transition-colors rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
														>
															{isSelected ? "✓" : "···"}
														</button>
													)}
												</div>

												<div className="flex-1 flex flex-col justify-center">
													<MetricCardContent title={title} overview={overview} size="1x1" />
												</div>

												<div className="pointer-events-none absolute inset-0">
													<div className="absolute bottom-0.5 right-0.5 w-3 h-3">
														<div className="w-full h-full border-b-[3px] border-r-[2px] border-slate-400/80 rounded-br-full" />
													</div>
												</div>
											</DashboardCard>

											{editMode && (
												<div className="mt-3 space-y-2">
													<button
														type="button"
														className="w-full px-3 py-2 text-sm font-medium text-foreground bg-accent hover:bg-accent/80 rounded-lg transition-colors"
													>
														Edit Widget
													</button>
													<button
														type="button"
														className="w-full px-3 py-2 text-sm font-medium text-foreground bg-accent hover:bg-accent/80 rounded-lg transition-colors"
													>
														Duplicate
													</button>
												</div>
											)}
										</div>
									);
								})}
							</div>
						</section>
					)}

					{editMode && viewMode === "grid" && (
						<section>
							<h2 className="text-xl font-semibold text-foreground mb-4">Create New Widget</h2>
							<DashboardCard className="p-6">
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-foreground mb-2">
											Widget Title
										</label>
										<input
											type="text"
											placeholder="Enter widget title"
											className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-foreground mb-2">
											Subtitle
										</label>
										<input
											type="text"
											placeholder="Enter subtitle"
											className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-foreground mb-2">
												Value Prefix
											</label>
											<input
												type="text"
												placeholder="$ or %"
												className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-foreground mb-2">
												Trend %
											</label>
											<input
												type="number"
												placeholder="6.3"
												className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-foreground mb-2">
											Icon
										</label>
										<select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option>PoundSterling</option>
											<option>TrendingUp</option>
											<option>Users</option>
											<option>ShoppingCart</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-foreground mb-2">
											Widget Type
										</label>
										<select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500">
											<option>Single Metric with Chart</option>
											<option>Multi-Metric Grid</option>
											<option>Large Centered Metric</option>
											<option>Revenue Breakdown</option>
										</select>
									</div>

									<div className="flex gap-3 pt-4">
										<button
											type="button"
											className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
										>
											Create Widget
										</button>
										<button
											type="button"
											className="px-4 py-2 bg-accent text-foreground rounded-lg font-medium hover:bg-accent/80 transition-colors"
										>
											Cancel
										</button>
									</div>
								</div>
							</DashboardCard>
						</section>
					)}

					<section>
						<h2 className="text-xl font-semibold text-foreground mb-4">Widget Configuration</h2>
						<DashboardCard className="p-6">
							<div className="space-y-4">
								<div>
									<h3 className="text-sm font-semibold text-foreground mb-2">Current Widgets</h3>
									<pre className="bg-black/20 p-4 rounded-lg text-xs text-foreground overflow-x-auto">
										{JSON.stringify(METRIC_CONFIGS, null, 2)}
									</pre>
								</div>
							</div>
						</DashboardCard>
					</section>
				</div>
			</div>
		</div>
	);
}
