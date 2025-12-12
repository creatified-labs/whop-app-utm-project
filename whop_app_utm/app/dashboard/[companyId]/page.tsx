"use client";

import { useEffect, useRef, useState } from "react";
import RGL, { WidthProvider, type Layout } from "react-grid-layout";
import { useParams } from "next/navigation";
import {
	DashboardCard,
	DashboardCardHeader,
	DashboardCardBody,
} from "@/components/ui/DashboardCard";
import {
	PoundSterling,
	TrendingUp,
	Users,
	ShoppingCart,
	Monitor,
	type LucideIcon,
} from "lucide-react";
import { Newsletter } from "@/components/marketing/Newsletter";
import { useOverviewMetrics } from "@/lib/utm/hooks";
import type { OverviewMetrics } from "@/lib/utm/types";
import { useCurrentPlan } from "@/lib/useCurrentPlan";
import { DeviceBreakdownCard } from "@/components/dashboard/DeviceBreakdownCard";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ReactGridLayout = WidthProvider(RGL);

const GRID_COLS = 4;

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
	"Device Breakdown": {
		title: "Device Breakdown",
		value: 0,
		valuePrefix: "",
		subtitle: "Traffic by device",
		trend: undefined,
		icon: Monitor,
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

function MetricCardContent({
	title,
	overview,
}: {
	title: string;
	overview: OverviewMetrics;
}) {
	const config = METRIC_CONFIGS[title] ?? DEFAULT_METRIC;

	const totalRevenue = overview.totalRevenue;
	const totalClicks = overview.totalClicks;
	const totalOrders = overview.totalOrders;
	const avgOrderValue = overview.avgOrderValue;
	const overallConversionRate = overview.overallConversionRate * 100;

	const round4 = (value: number) => Number(value.toFixed(4));

	// Generate mock line chart data (similar to WAP dashboard)
	const generateLineChartData = () => {
		const points = 20;
		const trend = config.trend ?? 0;

		const phaseOffset =
			title === "MRR" ? 0 : title === "Total Stats" ? 1 : title === "Metric" ? 2 : 3;

		return Array.from({ length: points }, (_, i) => {
			const x = (i / Math.max(points - 1, 1)) * Math.PI * 2 + phaseOffset;
			const wave = 0.3 * Math.sin(x);
			const trendFactor =
				(trend / 100) * (i / Math.max(points - 1, 1)) * 0.5;

			const value = 0.5 + wave + trendFactor;
			return round4(Math.max(0.1, Math.min(0.9, value)));
		});
	};

	const lineData = generateLineChartData();

	// Render mini line chart (similar to WAP dashboard)
	const renderLineChart = () => {
		const trendColor = (config.trend ?? 0) >= 0 ? "#3b82f6" : "#f87171";
		const width = 100;
		const height = 100;

		const points = lineData.map((value, i) => {
			const x = round4((i / (lineData.length - 1)) * width);
			const y = round4(height - value * height);
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

type ModuleSize = "1x1" | "2x1" | "1x2";

interface DashboardModule {
	id: string;
	title: string;
	size: ModuleSize;
}

const WIDGET_TITLES = [
	"MRR",
	"Total Stats",
	"Metric",
	"Total Revenue",
	"Device Breakdown",
] as const;

const initialModules: DashboardModule[] = [
	{ id: "m1", title: "MRR", size: "1x1" },
	{ id: "m2", title: "Total Stats", size: "1x1" },
	{ id: "m3", title: "Metric", size: "1x1" },
	{ id: "m4", title: "Total Revenue", size: "1x1" },
];

function computeLayoutForCols(
	modules: DashboardModule[],
	cols: number,
): Layout[] {
	let x = 0;
	let y = 0;

	return modules.map((module) => {
		const w = module.size === "2x1" ? 2 : 1;
		const h = module.size === "1x2" ? 2 : 1;

		const maxCols = Math.max(cols, 1);
		const clampedW = Math.min(w, maxCols);

		if (x + clampedW > maxCols) {
			x = 0;
			y += 1;
		}

		const item: Layout = {
			i: module.id,
			x,
			y,
			w: clampedW,
			h,
			minW: 1,
			maxW: Math.min(2, maxCols),
			minH: 1,
			maxH: 2,
		};

		x += clampedW;
		return item;
	});
}

function createInitialLayout(modules: DashboardModule[]): Layout[] {
	return computeLayoutForCols(modules, GRID_COLS);
}

export default function DashboardPage() {
	const params = useParams() as { companyId?: string };
	const companyId = params.companyId ?? "default";

	const { capabilities } = useCurrentPlan();

	const [modules, setModules] = useState<DashboardModule[]>(initialModules);
	const [layout, setLayout] = useState<Layout[]>(() =>
		createInitialLayout(initialModules),
	);
	const [cols, setCols] = useState(GRID_COLS);
	const [rowHeight, setRowHeight] = useState(160);
	const [menuForId, setMenuForId] = useState<string | null>(null);
	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const desktopLayoutRef = useRef<Layout[] | null>(null);

	const atWidgetLimit =
		capabilities.maxWidgets !== null &&
		modules.length >= capabilities.maxWidgets;

	const overview = useOverviewMetrics();

	const saveDashboardConfig = (nextModules: DashboardModule[], nextLayout: Layout[]) => {
		void (async () => {
			try {
				await fetch(`/api/dashboard-layout/${companyId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ modules: nextModules, layout: nextLayout }),
				});
			} catch {
				// Best-effort persistence
			}
		})();
	};

	const handleLayoutChange = (newLayout: Layout[]) => {
		setLayout(newLayout);
		if (cols === GRID_COLS) {
			desktopLayoutRef.current = newLayout;
		}
		saveDashboardConfig(modules, newLayout);
	};

	const handleAddWidgetOfType = (widgetTitle: string) => {
		if (
			capabilities.maxWidgets !== null &&
			modules.length >= capabilities.maxWidgets
		) {
			return;
		}

		const nextIndex = modules.length + 1;
		const id = `m${nextIndex}`;
		const newModule: DashboardModule = {
			id,
			title: widgetTitle,
			size: "1x1",
		};

		const nextModules = [...modules, newModule];
		const nextLayout: Layout[] = [
			...layout,
			{
				i: id,
				x: 0,
				y: Infinity,
				w: 1,
				h: 1,
				minW: 1,
				maxW: 2,
				minH: 1,
				maxH: 2,
			},
		];

		setModules(nextModules);
		setLayout(nextLayout);
		saveDashboardConfig(nextModules, nextLayout);
	};

	const handleRemoveModule = (id: string) => {
		const nextModules = modules.filter((module) => module.id !== id);
		const nextLayout = layout.filter((item) => item.i !== id);

		setModules(nextModules);
		setLayout(nextLayout);
		saveDashboardConfig(nextModules, nextLayout);
	};

	const handleChangeWidget = (id: string, nextTitle: string) => {
		const nextModules = modules.map((module) =>
			module.id === id
				? {
					...module,
					title: nextTitle,
				}
				: module,
		);

		setModules(nextModules);
		saveDashboardConfig(nextModules, layout);
	};

	useEffect(() => {
		let cancelled = false;

		async function loadDashboardConfig() {
			try {
				const res = await fetch(`/api/dashboard-layout/${companyId}`);
				if (!res.ok) return;

				const data = (await res.json()) as {
					modules?: DashboardModule[];
					layout?: Layout[];
				};
				if (cancelled) return;

				if (Array.isArray(data.modules) && data.modules.length > 0) {
					setModules(data.modules);
				}
				if (Array.isArray(data.layout) && data.layout.length > 0) {
					setLayout(data.layout);
				}
			} catch {
				if (cancelled) return;
			}
		}

		void loadDashboardConfig();

		return () => {
			cancelled = true;
		};
	}, [companyId]);

	useEffect(() => {
		if (!desktopLayoutRef.current && layout.length > 0 && cols === GRID_COLS) {
			desktopLayoutRef.current = layout;
		}
	}, [layout, cols]);

	useEffect(() => {
		const handleResize = () => {
			if (typeof window === "undefined") return;

			const width = window.innerWidth;

			let nextCols = GRID_COLS;
			if (width < 640) {
				nextCols = 1;
			} else if (width < 1280) {
				nextCols = 2;
			} else {
				nextCols = GRID_COLS;
			}

			const isReturningToDesktop = nextCols === GRID_COLS && cols !== GRID_COLS;
			if (isReturningToDesktop && desktopLayoutRef.current) {
				setLayout(desktopLayoutRef.current);
			} else if (nextCols !== GRID_COLS) {
				const responsiveLayout = computeLayoutForCols(modules, nextCols);
				setLayout(responsiveLayout);
			}
			setCols(nextCols);

			const container = document.querySelector<HTMLElement>(".layout-shell");
			if (container) {
				const width = container.clientWidth;
				if (width > 0) {
					setRowHeight(width / nextCols);
				}
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [modules, cols]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleGlobalAdd = () => {
			if (
				capabilities.maxWidgets !== null &&
				modules.length >= capabilities.maxWidgets
			) {
				return;
			}
			setIsPickerOpen(true);
		};

		window.addEventListener("utm-dashboard-add-widget", handleGlobalAdd);
		return () => window.removeEventListener("utm-dashboard-add-widget", handleGlobalAdd);
	}, [capabilities.maxWidgets, modules.length]);

	return (
		<div className="min-h-screen bg-background p-4 md:p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-foreground">Stats</h1>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => {
								if (atWidgetLimit) return;
								setIsPickerOpen(true);
							}}
							className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
							disabled={atWidgetLimit}
						>
							<span className="text-base leading-none">+</span>
							<span>Add</span>
						</button>
						<button
							type="button"
							onClick={() => setIsEditMode(!isEditMode)}
							className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${isEditMode
								? 'bg-blue-500 text-white border-blue-500'
								: 'border-border bg-background hover:bg-accent'
								}`}
						>
							<span>Edit</span>
						</button>
					</div>
				</div>

				<div className="layout-shell">
					<ReactGridLayout
						className="layout"
						cols={cols}
						rowHeight={rowHeight}
						margin={[16, 16]}
						containerPadding={[0, 16]}
						compactType="vertical"
						layout={layout}
						onLayoutChange={handleLayoutChange}
						draggableHandle=".dashboard-module-drag-handle"
						isResizable={isEditMode}
						isDraggable={isEditMode}
					>
						{modules.map((module) => {
							const metricConfig = METRIC_CONFIGS[module.title] ?? DEFAULT_METRIC;
							const HeaderIcon = metricConfig.icon;

							return (
								<div key={module.id}>
									<DashboardCard className="h-full min-h-[160px] flex flex-col relative p-4 sm:p-5">
										{isEditMode && (
											<div className="absolute inset-x-0 top-0 z-20 flex justify-center pointer-events-none">
												<button
													type="button"
													aria-label="Drag widget"
													className="dashboard-module-drag-handle pointer-events-auto h-2 w-12 cursor-move bg-black/10 hover:bg-black/15 dark:bg-white/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/15 backdrop-blur-xl transition-colors"
													style={{
														clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)",
														WebkitClipPath:
															"polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)",
														borderRadius: "0 0 10px 10px",
													}}
												/>
											</div>
										)}

										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center gap-2.5">
												<div className="p-2 rounded-lg bg-white/5 border border-white/10">
													<HeaderIcon className="h-4 w-4 text-foreground/80" />
												</div>
												<div>
													<h3 className="text-sm font-semibold text-foreground">
														{module.title}
													</h3>
													<p className="text-[10px] text-muted-foreground mt-0.5">
														{metricConfig.subtitle}
													</p>
												</div>
											</div>
											{isEditMode && (
												<div className="relative">
													<button
														type="button"
														onClick={() =>
															setMenuForId((current) =>
																current === module.id ? null : module.id,
															)
														}
														className="h-7 w-7 flex items-center justify-center text-[11px] text-muted-foreground transition-colors rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 dark:border-transparent dark:bg-transparent dark:hover:bg-transparent dark:text-white"
													>
														···
													</button>
													{menuForId === module.id && (
														<div className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 rounded-xl bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 shadow-xl text-xs overflow-hidden">
															<div className="py-1">
																{WIDGET_TITLES.map((title) => (
																	<button
																		key={title}
																		type="button"
																		onClick={() => {
																			handleChangeWidget(module.id, title);
																			setMenuForId(null);
																		}}
																		className="flex w-full items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
																	>
																		<span>{title}</span>
																	</button>
																))}
															</div>
															<div className="border-t border-gray-200 dark:border-white/10">
																<button
																	type="button"
																	onClick={() => {
																		handleRemoveModule(module.id);
																		setMenuForId(null);
																	}}
																	className="flex w-full items-center justify-between px-3 py-2 text-red-500 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
																>
																	<span>Remove widget</span>
																</button>
															</div>
														</div>
													)}
												</div>
											)}
										</div>

										<div className="flex-1 flex flex-col justify-center">
											{module.title === "Device Breakdown" ? (
												<DeviceBreakdownCard />
											) : (
												<MetricCardContent title={module.title} overview={overview} />
											)}
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
					</ReactGridLayout>
				</div>

				{isPickerOpen && (
					<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
						<div className="mx-4 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#121212] shadow-xl p-6">
							<div className="flex items-center justify-between gap-3 mb-6">
								<div>
									<h2 className="text-lg font-semibold text-foreground">
										Select widgets
									</h2>
								</div>
								<div className="flex items-center gap-3">
									<span className="text-sm text-muted-foreground">
										{modules.length} widget{modules.length !== 1 ? 's' : ''} selected
									</span>
									<button
										type="button"
										onClick={() => setIsPickerOpen(false)}
										className="h-7 w-7 rounded-full text-xs text-muted-foreground hover:bg-accent transition-colors"
									>
										✕
									</button>
								</div>
							</div>

							<div className="mb-6">
								<h3 className="text-sm font-semibold text-foreground mb-4">Stats</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{WIDGET_TITLES.map((title) => {
										const config = METRIC_CONFIGS[title] ?? DEFAULT_METRIC;
										const Icon = config.icon;
										const isAdded = modules.some(m => m.title === title);

										return (
											<button
												key={title}
												type="button"
												onClick={() => {
													if (isAdded) {
														const moduleToRemove = modules.find(m => m.title === title);
														if (moduleToRemove) handleRemoveModule(moduleToRemove.id);
													} else {
														handleAddWidgetOfType(title);
													}
												}}
												className="group relative text-left w-full"
											>
												<DashboardCard className={`h-48 flex flex-col relative p-4 overflow-hidden transition-all ${isAdded ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-500/50'
													}`}>
													{isAdded && (
														<div className="absolute top-2 right-2 z-10">
															<div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
																<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
																</svg>
															</div>
														</div>
													)}
													<div className="flex items-start gap-2.5 mb-3">
														<div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
															<Icon className="h-3.5 w-3.5 text-foreground/80" />
														</div>
														<div>
															<div className="text-xs font-semibold text-foreground">
																{title}
															</div>
															<div className="text-[10px] text-muted-foreground mt-0.5">
																{config.subtitle}
															</div>
														</div>
													</div>
													<div className="flex-1 flex flex-col justify-center scale-90 origin-top-left">
														<MetricCardContent title={title} overview={overview} />
													</div>
												</DashboardCard>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				)
				}

				<Newsletter />
			</div>
		</div>
	);
}
