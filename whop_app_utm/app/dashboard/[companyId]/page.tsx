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
	Target,
	ExternalLink,
	Package,
	Radio,
	BarChart3,
	Activity,
	Zap,
	MousePointerClick,
	DollarSign,
	Percent,
	Calendar,
	Clock,
	Smartphone,
	List,
	MoreVertical,
	X,
	Globe,
	Link,
	GitBranch,
	Laptop,
	Chrome,
	type LucideIcon,
} from "lucide-react";
import { Newsletter } from "@/components/marketing/Newsletter";
import { useUtmData } from "@/lib/utm/hooks";
import { getOverviewMetrics } from "@/lib/utm/metrics";
import type { OverviewMetrics, VisitorEvent, Order } from "@/lib/utm/types";
import { useCurrentPlan } from "@/lib/useCurrentPlan";
import { DeviceBreakdownCard } from "@/components/dashboard/DeviceBreakdownCard";
import { CampaignWidget } from "@/components/dashboard/widgets/CampaignWidget";
import { SourceWidget } from "@/components/dashboard/widgets/SourceWidget";
import { ProductWidget } from "@/components/dashboard/widgets/ProductWidget";
import { DestinationWidget } from "@/components/dashboard/widgets/DestinationWidget";
import { PinnedLinksWidget } from "@/components/dashboard/widgets/PinnedLinksWidget";
// New consolidated widgets
import { RevenueOverview } from "@/components/dashboard/widgets/RevenueOverview";
import { CampaignPerformanceTable } from "@/components/dashboard/widgets/CampaignPerformanceTable";
import { SourcePerformanceTable } from "@/components/dashboard/widgets/SourcePerformanceTable";
import { ProductPerformanceTable } from "@/components/dashboard/widgets/ProductPerformanceTable";
import { DestinationAnalysisTable } from "@/components/dashboard/widgets/DestinationAnalysisTable";
// New device & geo widgets
import { BrowserAnalytics } from "@/components/dashboard/widgets/BrowserAnalytics";
import { OSDistribution } from "@/components/dashboard/widgets/OSDistribution";
import { GeographicOverview } from "@/components/dashboard/widgets/GeographicOverview";
import { MobileVsDesktop } from "@/components/dashboard/widgets/MobileVsDesktop";
import { TrafficQuality } from "@/components/dashboard/widgets/TrafficQuality";
// New time intelligence widgets
import { TodaysSnapshot } from "@/components/dashboard/widgets/TodaysSnapshot";
import { WeeklyPerformance } from "@/components/dashboard/widgets/WeeklyPerformance";
import { PeakHours } from "@/components/dashboard/widgets/PeakHours";
// Other new widgets
import { UTMFunnel } from "@/components/dashboard/widgets/UTMFunnel";
import { ActiveLinks } from "@/components/dashboard/widgets/ActiveLinks";
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
	// Overview Metrics
	"Revenue Overview": {
		title: "Revenue Overview",
		value: 0,
		valuePrefix: "$",
		subtitle: "Total attributed revenue",
		trend: undefined,
		icon: DollarSign,
	},
	"Total Clicks": {
		title: "Total Clicks",
		value: 0,
		valuePrefix: "",
		subtitle: "Link clicks tracked",
		trend: undefined,
		icon: MousePointerClick,
	},
	"Conversion Rate": {
		title: "Conversion Rate",
		value: 0,
		valuePrefix: "",
		subtitle: "Clicks to orders",
		trend: undefined,
		icon: Percent,
	},
	"Active Links": {
		title: "Active Links",
		value: 0,
		valuePrefix: "",
		subtitle: "Non-archived tracking links",
		trend: undefined,
		icon: Link,
	},
	// UTM Performance
	"Campaign Performance": {
		title: "Campaign Performance",
		value: 0,
		valuePrefix: "",
		subtitle: "Top campaigns by revenue",
		trend: undefined,
		icon: Target,
	},
	"Source Performance": {
		title: "Source Performance",
		value: 0,
		valuePrefix: "",
		subtitle: "Top sources by revenue",
		trend: undefined,
		icon: Radio,
	},
	"Product Performance": {
		title: "Product Performance",
		value: 0,
		valuePrefix: "",
		subtitle: "Top products by sales",
		trend: undefined,
		icon: Package,
	},
	"Destination Analysis": {
		title: "Destination Analysis",
		value: 0,
		valuePrefix: "",
		subtitle: "Top destinations by clicks",
		trend: undefined,
		icon: ExternalLink,
	},
	"UTM Funnel": {
		title: "UTM Funnel",
		value: 0,
		valuePrefix: "",
		subtitle: "Attribution flow visualization",
		trend: undefined,
		icon: GitBranch,
	},
	// Performance Charts
	"Revenue Chart": {
		title: "Revenue Chart",
		value: 0,
		valuePrefix: "",
		subtitle: "Revenue over time",
		trend: undefined,
		icon: BarChart3,
	},
	"Clicks Chart": {
		title: "Clicks Chart",
		value: 0,
		valuePrefix: "",
		subtitle: "Click trends",
		trend: undefined,
		icon: Activity,
	},
	"Orders Chart": {
		title: "Orders Chart",
		value: 0,
		valuePrefix: "",
		subtitle: "Order volume",
		trend: undefined,
		icon: TrendingUp,
	},
	"Conversion Trend": {
		title: "Conversion Trend",
		value: 0,
		valuePrefix: "",
		subtitle: "Conversion over time",
		trend: undefined,
		icon: Zap,
	},
	// Device & Geo Analytics
	"Device Breakdown": {
		title: "Device Breakdown",
		value: 0,
		valuePrefix: "",
		subtitle: "Traffic by device",
		trend: undefined,
		icon: Monitor,
	},
	"Browser Analytics": {
		title: "Browser Analytics",
		value: 0,
		valuePrefix: "",
		subtitle: "Top browsers by sessions",
		trend: undefined,
		icon: Chrome,
	},
	"OS Distribution": {
		title: "OS Distribution",
		value: 0,
		valuePrefix: "",
		subtitle: "Operating system breakdown",
		trend: undefined,
		icon: Laptop,
	},
	"Geographic Overview": {
		title: "Geographic Overview",
		value: 0,
		valuePrefix: "",
		subtitle: "Top countries by revenue",
		trend: undefined,
		icon: Globe,
	},
	"Mobile vs Desktop": {
		title: "Mobile vs Desktop",
		value: 0,
		valuePrefix: "",
		subtitle: "Device comparison",
		trend: undefined,
		icon: Smartphone,
	},
	"Traffic Quality": {
		title: "Traffic Quality",
		value: 0,
		valuePrefix: "",
		subtitle: "CVR by device type",
		trend: undefined,
		icon: Target,
	},
	// Time Intelligence
	"Today's Snapshot": {
		title: "Today's Snapshot",
		value: 0,
		valuePrefix: "$",
		subtitle: "Today vs yesterday",
		trend: undefined,
		icon: Calendar,
	},
	"Weekly Performance": {
		title: "Weekly Performance",
		value: 0,
		valuePrefix: "$",
		subtitle: "7-day rolling metrics",
		trend: undefined,
		icon: Calendar,
	},
	"Recent Activity": {
		title: "Recent Activity",
		value: 0,
		valuePrefix: "",
		subtitle: "Latest events",
		trend: undefined,
		icon: Clock,
	},
	"Peak Hours": {
		title: "Peak Hours",
		value: 0,
		valuePrefix: "",
		subtitle: "Orders by hour",
		trend: undefined,
		icon: Clock,
	},
	// Links & Tracking
	"Pinned Links": {
		title: "Pinned Links",
		value: 0,
		valuePrefix: "",
		subtitle: "Your top tracking links",
		trend: undefined,
		icon: List,
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

// Get widget type for settings menu
function getWidgetType(widgetTitle: string): "campaign" | "source" | "product" | "destination" | "links" | "timePeriod" | "none" {
	if (["Top Campaign", "Campaign List"].includes(widgetTitle)) return "campaign";
	if (["Top Source", "Source List"].includes(widgetTitle)) return "source";
	if (["Top Product"].includes(widgetTitle)) return "product";
	if (["Top Destination"].includes(widgetTitle)) return "destination";
	if (["Pinned Links"].includes(widgetTitle)) return "links";
	if (["MRR", "Total Revenue", "Total Clicks", "Metric"].includes(widgetTitle)) return "timePeriod";
	return "none";
}

// Get time period options for metrics
const TIME_PERIOD_OPTIONS = [
	"Last 7 Days",
	"Last 30 Days",
	"Last 90 Days",
	"All Time",
];

// Helper function to filter events and orders by time period
function filterByTimePeriod(
	events: VisitorEvent[],
	orders: Order[],
	timePeriod?: string
): { filteredEvents: VisitorEvent[]; filteredOrders: Order[] } {
	if (!timePeriod || timePeriod === "All Time") {
		return { filteredEvents: events, filteredOrders: orders };
	}

	const now = new Date();
	let cutoffDate: Date;

	switch (timePeriod) {
		case "Last 7 Days":
			cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			break;
		case "Last 30 Days":
			cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			break;
		case "Last 90 Days":
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

// Helper function to calculate overview metrics for a specific widget
function getWidgetOverviewMetrics(
	links: any[],
	events: VisitorEvent[],
	orders: Order[],
	timePeriod?: string
): OverviewMetrics {
	const { filteredEvents, filteredOrders } = filterByTimePeriod(
		events,
		orders,
		timePeriod
	);
	return getOverviewMetrics(links, filteredEvents, filteredOrders);
}

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

	// Handle Total Clicks widget
	if (title === "Total Clicks") {
		return (
			<div className="h-full flex flex-col justify-center">
				<div className="text-3xl font-bold text-foreground">
					{totalClicks > 0 ? totalClicks.toLocaleString() : "0"}
				</div>
				<div className="text-xs text-muted-foreground mt-1">
					{totalClicks > 0 ? "Link clicks tracked" : "No clicks yet - create a link to start tracking"}
				</div>
			</div>
		);
	}

	// Handle Conversion Rate widget
	if (title === "Conversion Rate") {
		return (
			<div className="h-full flex flex-col justify-center">
				<div className="text-3xl font-bold text-foreground">
					{overallConversionRate > 0 ? `${overallConversionRate.toFixed(1)}%` : "0.0%"}
				</div>
				<div className="text-xs text-muted-foreground mt-1">
					{totalClicks > 0 ? "Clicks to orders" : "No data yet - clicks will appear when links are visited"}
				</div>
			</div>
		);
	}

	// Handle chart widgets
	if (title === "Revenue Chart" || title === "Clicks Chart" || title === "Orders Chart" || title === "Conversion Trend") {
		const hasData = totalClicks > 0 || totalOrders > 0 || totalRevenue > 0;

		if (!hasData) {
			return (
				<div className="h-full flex items-center justify-center">
					<div className="text-center">
						<div className="text-sm text-muted-foreground">No data yet</div>
						<div className="text-xs text-muted-foreground/60 mt-1">
							Data will appear as your links get clicks
						</div>
					</div>
				</div>
			);
		}

		// Determine which value to show
		let displayValue = "";
		let displayLabel = "";

		if (title === "Revenue Chart") {
			displayValue = `$${totalRevenue.toLocaleString()}`;
			displayLabel = "Total Revenue";
		} else if (title === "Clicks Chart") {
			displayValue = totalClicks.toLocaleString();
			displayLabel = "Total Clicks";
		} else if (title === "Orders Chart") {
			displayValue = totalOrders.toLocaleString();
			displayLabel = "Total Orders";
		} else if (title === "Conversion Trend") {
			displayValue = `${overallConversionRate.toFixed(1)}%`;
			displayLabel = "Conversion Rate";
		}

		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="space-y-1 mb-2">
					<div className="text-2xl font-bold text-foreground">
						{displayValue}
					</div>
					<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
						{displayLabel}
					</div>
				</div>
				<div className="mt-auto">
					{renderLineChart()}
				</div>
			</div>
		);
	}

	// Handle Recent Activity widget
	if (title === "Recent Activity") {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-center">
					<div className="text-sm text-muted-foreground">No recent activity</div>
					<div className="text-xs text-muted-foreground/60 mt-1">
						Activity will appear as events occur
					</div>
				</div>
			</div>
		);
	}

	// Default fallback for any other widgets
	return (
		<div className="h-full flex items-center justify-center">
			<div className="text-center">
				<div className="text-sm text-muted-foreground">No data available</div>
				<div className="text-xs text-muted-foreground/60 mt-1">
					Create tracking links to see metrics
				</div>
			</div>
		</div>
	);
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface DashboardModule {
	id: string;
	title: string;
	size: ModuleSize;
	settings?: {
		selectedSlugs?: string[]; // For Pinned Links widget
		selectedCampaign?: string; // For Campaign widgets
		selectedSource?: string; // For Source widgets
		selectedProduct?: string; // For Product widgets
		selectedDestination?: string; // For Destination widgets
		timePeriod?: string; // For MRR and metric widgets
	};
}

const WIDGET_CATEGORIES = {
	"Overview Metrics": [
		"Revenue Overview",
		"Total Clicks",
		"Conversion Rate",
		"Active Links",
	],
	"UTM Performance": [
		"Campaign Performance",
		"Source Performance",
		"Product Performance",
		"Destination Analysis",
		"UTM Funnel",
	],
	"Performance Charts": [
		"Revenue Chart",
		"Clicks Chart",
		"Orders Chart",
		"Conversion Trend",
	],
	"Device & Geo Analytics": [
		"Device Breakdown",
		"Browser Analytics",
		"OS Distribution",
		"Geographic Overview",
		"Mobile vs Desktop",
		"Traffic Quality",
	],
	"Time Intelligence": [
		"Today's Snapshot",
		"Weekly Performance",
		"Recent Activity",
		"Peak Hours",
	],
	"Links & Tracking": [
		"Pinned Links",
	],
} as const;

const WIDGET_TITLES = [
	...WIDGET_CATEGORIES["Overview Metrics"],
	...WIDGET_CATEGORIES["UTM Performance"],
	...WIDGET_CATEGORIES["Performance Charts"],
	...WIDGET_CATEGORIES["Device & Geo Analytics"],
	...WIDGET_CATEGORIES["Time Intelligence"],
	...WIDGET_CATEGORIES["Links & Tracking"],
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
	const maxCols = Math.max(cols, 1);
	const layout: Layout[] = [];

	// Track occupied cells in a grid
	const grid: boolean[][] = [];

	// Initialize grid with enough rows (we'll expand as needed)
	const initRows = Math.ceil(modules.length / maxCols) * 2 + 10;
	for (let i = 0; i < initRows; i++) {
		grid[i] = new Array(maxCols).fill(false);
	}

	modules.forEach((module) => {
		// Get widget dimensions
		const w = module.size === "2x1" || module.size === "2x2" ? 2 : 1;
		const h = module.size === "1x2" || module.size === "2x2" ? 2 : 1;

		// Clamp width to available columns
		// For 2-column layouts (tablet), keep widgets at 1 column to allow side-by-side placement
		let clampedW = Math.min(w, maxCols);
		if (maxCols === 2 && w === 2) {
			clampedW = 1; // Force 1 column width in tablet view for side-by-side layout
		}

		// Find the first available position (left-to-right, top-to-bottom)
		let placed = false;
		let bestX = 0;
		let bestY = 0;

		// Scan grid from top-left to find first fit
		for (let y = 0; y < grid.length && !placed; y++) {
			for (let x = 0; x <= maxCols - clampedW && !placed; x++) {
				// Check if this position can fit the widget
				let canFit = true;

				// Ensure we have enough rows
				while (grid.length < y + h) {
					grid.push(new Array(maxCols).fill(false));
				}

				// Check all cells the widget would occupy
				for (let dy = 0; dy < h && canFit; dy++) {
					for (let dx = 0; dx < clampedW && canFit; dx++) {
						if (grid[y + dy][x + dx]) {
							canFit = false;
						}
					}
				}

				if (canFit) {
					// Mark cells as occupied
					for (let dy = 0; dy < h; dy++) {
						for (let dx = 0; dx < clampedW; dx++) {
							grid[y + dy][x + dx] = true;
						}
					}
					bestX = x;
					bestY = y;
					placed = true;
				}
			}
		}

		layout.push({
			i: module.id,
			x: bestX,
			y: bestY,
			w: clampedW,
			h,
			minW: 1,
			maxW: Math.min(2, maxCols),
			minH: 1,
			maxH: 2,
		});
	});

	return layout;
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
	const [gridMargin, setGridMargin] = useState<[number, number]>([16, 16]);
	const [menuForId, setMenuForId] = useState<string | null>(null);
	const [isPickerOpen, setIsPickerOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [availableLinks, setAvailableLinks] = useState<Array<{ slug: string; name: string }>>([]);
	const [availableCampaigns, setAvailableCampaigns] = useState<string[]>([]);
	const [availableSources, setAvailableSources] = useState<string[]>([]);
	const [availableProducts, setAvailableProducts] = useState<string[]>([]);
	const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
	const desktopLayoutRef = useRef<Layout[]>(createInitialLayout(initialModules));

	const atWidgetLimit =
		capabilities.maxWidgets !== null &&
		modules.length >= capabilities.maxWidgets;

	// Get raw data for filtering by time period
	const { links, events, orders } = useUtmData();

	// Fetch available links for Pinned Links widget settings
	useEffect(() => {
		const fetchAvailableLinks = async () => {
			try {
				// Fetch both Whop tracking links and advanced links in parallel
				const [whopRes, advancedRes] = await Promise.all([
					fetch("/api/tracking-links"),
					fetch("/api/advanced-links-data"),
				]);

				const whopData = whopRes.ok ? await whopRes.json() : { links: [] };
				const advancedData = advancedRes.ok ? await advancedRes.json() : { links: [] };

				console.log("[Pinned Links] Whop links:", whopData.links?.length || 0);
				console.log("[Pinned Links] Advanced links:", advancedData.links?.length || 0);

				// Merge links from both sources
				const allLinks = [
					...(Array.isArray(whopData.links) ? whopData.links : []),
					...(Array.isArray(advancedData.links) ? advancedData.links : []),
				].map((link: any) => ({
					slug: link.slug,
					name: link.name || link.slug,
				}));

				console.log("[Pinned Links] Total merged links:", allLinks.length);
				console.log("[Pinned Links] Sample links:", allLinks.slice(0, 3));

				setAvailableLinks(allLinks);
			} catch (error) {
				console.error("[Pinned Links] Failed to fetch available links:", error);
			}
		};
		fetchAvailableLinks();
	}, []);

	// Fetch available campaigns, sources, products, and destinations
	useEffect(() => {
		const fetchOptions = async () => {
			const endDate = new Date();
			const startDate = new Date();
			startDate.setDate(startDate.getDate() - 90); // Last 90 days

			try {
				// Fetch campaigns
				const campaignRes = await fetch(
					`/api/reports/campaign-breakdown?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
				);
				const campaignJson = await campaignRes.json();
				const campaigns = (campaignJson.breakdown || [])
					.map((item: any) => item.campaign)
					.filter((c: string) => c && c !== "No campaigns yet");
				setAvailableCampaigns(campaigns);

				// Fetch sources
				const sourceRes = await fetch(
					`/api/reports/source-breakdown?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
				);
				const sourceJson = await sourceRes.json();
				const sources = (sourceJson.breakdown || [])
					.map((item: any) => item.utmSource)
					.filter((s: string) => s && s !== "No sources yet");
				setAvailableSources(sources);

				// Fetch products
				const productRes = await fetch(
					`/api/reports/product-breakdown?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
				);
				const productJson = await productRes.json();
				const products = (productJson.breakdown || [])
					.map((item: any) => item.product)
					.filter((p: string) => p && p !== "No products yet");
				setAvailableProducts(products);

				// Fetch destinations
				const destinationRes = await fetch(
					`/api/reports/destination-breakdown?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
				);
				const destinationJson = await destinationRes.json();
				const destinations = (destinationJson.breakdown || [])
					.map((item: any) => item.destination)
					.filter((d: string) => d && d !== "No destinations yet");
				setAvailableDestinations(destinations);
			} catch (error) {
				console.error("Failed to fetch widget options:", error);
			}
		};
		fetchOptions();
	}, []);

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
		// Update desktopLayoutRef whenever layout changes in desktop mode
		if (cols === GRID_COLS) {
			desktopLayoutRef.current = newLayout;
		}

		// Always update layout state to reflect changes
		setLayout(newLayout);

		// Only save manual layout changes and update module sizes when in edit mode
		if (isEditMode) {
			// Update module sizes based on layout
			const updatedModules = modules.map((module) => {
				const layoutItem = newLayout.find((item) => item.i === module.id);
				if (layoutItem) {
					const w = layoutItem.w;
					const h = layoutItem.h;
					const newSize: ModuleSize =
						w === 2 && h === 2 ? "2x2" :
							w === 2 && h === 1 ? "2x1" :
								w === 1 && h === 2 ? "1x2" :
									"1x1";
					return { ...module, size: newSize };
				}
				return module;
			});

			setModules(updatedModules);
			saveDashboardConfig(updatedModules, newLayout);
		}
	};

	// Helper function to get widget default size
	const getWidgetDefaultSize = (widgetTitle: string): ModuleSize => {
		// 2x2 widgets (tables and complex visualizations)
		if ([
			"Campaign Performance",
			"Source Performance",
			"Product Performance",
			"Destination Analysis",
			"UTM Funnel",
			"Geographic Overview",
			"Pinned Links",
		].includes(widgetTitle)) {
			return "2x2";
		}
		// 2x1 widgets (charts and expanded metrics)
		else if ([
			"Revenue Overview",
			"Browser Analytics",
			"OS Distribution",
			"Mobile vs Desktop",
			"Traffic Quality",
			"Weekly Performance",
			"Peak Hours",
			"Revenue Chart",
			"Clicks Chart",
			"Orders Chart",
			"Conversion Trend",
		].includes(widgetTitle)) {
			return "2x1";
		}
		// 1x2 widgets (vertical lists)
		else if ([
			"Recent Activity",
		].includes(widgetTitle)) {
			return "1x2";
		}
		// 1x1 widgets (default for simple metrics)
		return "1x1";
	};

	const handleAddWidgetOfType = (widgetTitle: string) => {
		if (
			capabilities.maxWidgets !== null &&
			modules.length >= capabilities.maxWidgets
		) {
			return;
		}

		// Find the highest existing module number to avoid duplicates
		const existingNumbers = modules
			.map((m) => {
				const match = m.id.match(/^m(\d+)$/);
				return match ? parseInt(match[1], 10) : 0;
			})
			.filter((n) => !isNaN(n));

		const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
		const nextIndex = maxNumber + 1;
		const id = `m${nextIndex}`;

		// Double-check the ID doesn't already exist
		if (modules.some(m => m.id === id)) {
			console.error('Duplicate module ID detected:', id);
			return;
		}

		const defaultSize = getWidgetDefaultSize(widgetTitle);

		const newModule: DashboardModule = {
			id,
			title: widgetTitle,
			size: defaultSize,
		};

		const nextModules = [...modules, newModule];
		const nextLayout = computeLayoutForCols(nextModules, cols);

		setModules(nextModules);
		setLayout(nextLayout);
		saveDashboardConfig(nextModules, nextLayout);
	};

	const handleRemoveModule = (id: string) => {
		const nextModules = modules.filter((module) => module.id !== id);
		const nextLayout = computeLayoutForCols(nextModules, cols);

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

	const handleToggleLinkSelection = (moduleId: string, slug: string) => {
		console.log("[Link Selection] Toggling:", slug);
		const nextModules = modules.map((module) => {
			if (module.id !== moduleId) return module;

			const currentSlugs = module.settings?.selectedSlugs || [];
			const newSlugs = currentSlugs.includes(slug)
				? currentSlugs.filter((s) => s !== slug)
				: [...currentSlugs, slug];

			console.log("[Link Selection] Current:", currentSlugs);
			console.log("[Link Selection] New:", newSlugs);
			console.log("[Link Selection] Is selected:", currentSlugs.includes(slug));

			return {
				...module,
				settings: {
					...module.settings,
					selectedSlugs: newSlugs,
				},
			};
		});

		setModules(nextModules);
		saveDashboardConfig(nextModules, layout);
	};

	const handleSelectCampaign = (moduleId: string, campaign: string) => {
		const nextModules = modules.map((module) =>
			module.id === moduleId
				? {
					...module,
					settings: {
						...module.settings,
						selectedCampaign: campaign,
					},
				}
				: module,
		);

		setModules(nextModules);
		saveDashboardConfig(nextModules, layout);
		setMenuForId(null);
	};

	const handleSelectSource = (moduleId: string, source: string) => {
		const nextModules = modules.map((module) =>
			module.id === moduleId
				? {
					...module,
					settings: {
						...module.settings,
						selectedSource: source,
					},
				}
				: module,
		);

		setModules(nextModules);
		saveDashboardConfig(nextModules, layout);
		setMenuForId(null);
	};

	const handleSelectProduct = (moduleId: string, product: string) => {
		const nextModules = modules.map((module) =>
			module.id === moduleId
				? {
					...module,
					settings: {
						...module.settings,
						selectedProduct: product,
					},
				}
				: module,
		);

		setModules(nextModules);
		saveDashboardConfig(nextModules, layout);
		setMenuForId(null);
	};

	const handleSelectDestination = (moduleId: string, destination: string) => {
		const nextModules = modules.map((module) =>
			module.id === moduleId
				? {
					...module,
					settings: {
						...module.settings,
						selectedDestination: destination,
					},
				}
				: module,
		);

		setModules(nextModules);
		saveDashboardConfig(nextModules, layout);
		setMenuForId(null);
	};

	const handleSelectTimePeriod = (moduleId: string, timePeriod: string) => {
		const nextModules = modules.map((module) =>
			module.id === moduleId
				? {
					...module,
					settings: {
						...module.settings,
						timePeriod: timePeriod,
					},
				}
				: module,
		);

		setModules(nextModules);
		saveDashboardConfig(nextModules, layout);
		setMenuForId(null);
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
					// Remove duplicate modules by ID
					const uniqueModules = data.modules.filter((module, index, self) =>
						index === self.findIndex(m => m.id === module.id)
					);

					setModules(uniqueModules);

					// Ensure layout matches modules
					if (Array.isArray(data.layout) && data.layout.length > 0) {
						const moduleIds = new Set(uniqueModules.map(m => m.id));
						// Remove duplicates and invalid layout items
						const validLayout = data.layout
							.filter((item, index, self) =>
								index === self.findIndex(l => l.i === item.i)
							)
							.filter(l => moduleIds.has(l.i));

						// If layout is valid and complete, use it; otherwise compute new layout
						if (validLayout.length === uniqueModules.length) {
							setLayout(validLayout);
						} else {
							setLayout(computeLayoutForCols(uniqueModules, cols));
						}
					} else {
						setLayout(computeLayoutForCols(uniqueModules, cols));
					}
				}
			} catch {
				if (cancelled) return;
			}
		}

		void loadDashboardConfig();

		return () => {
			cancelled = true;
		};
	}, [companyId, cols]);

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

			// Save current desktop layout before leaving desktop mode
			if (cols === GRID_COLS && nextCols !== GRID_COLS && layout.length > 0) {
				desktopLayoutRef.current = layout;
			}

			if (nextCols !== cols) {
				const isReturningToDesktop = nextCols === GRID_COLS && cols !== GRID_COLS;

				let newLayout: Layout[];

				if (isReturningToDesktop && desktopLayoutRef.current) {
					// Check if saved layout matches current modules
					const savedLayoutIds = new Set(desktopLayoutRef.current.map(l => l.i));
					const currentModuleIds = new Set(modules.map(m => m.id));
					const layoutMatches =
						savedLayoutIds.size === currentModuleIds.size &&
						[...savedLayoutIds].every(id => currentModuleIds.has(id));

					if (layoutMatches) {
						// Restore saved desktop layout
						newLayout = desktopLayoutRef.current;
					} else {
						// Modules changed, recompute layout
						newLayout = computeLayoutForCols(modules, nextCols);
						desktopLayoutRef.current = newLayout;
					}
				} else {
					// Recompute layout for new column count
					newLayout = computeLayoutForCols(modules, nextCols);

					// If we just moved to desktop, save this as the new desktop layout
					if (nextCols === GRID_COLS) {
						desktopLayoutRef.current = newLayout;
					}
				}

				// Update both layout and cols together to prevent intermediate states
				setLayout(newLayout);
				setCols(nextCols);
			}

			// Calculate row height and margin based on screen size for better responsive behavior
			const container = document.querySelector<HTMLElement>(".layout-shell");
			if (container) {
				const containerWidth = container.clientWidth;
				if (containerWidth > 0) {
					// Set margin based on screen size
					let margin: [number, number];

					if (nextCols === 1) {
						margin = [12, 12]; // Tighter spacing on mobile
					} else if (nextCols === 2) {
						margin = [14, 14]; // Medium spacing on tablet
					} else {
						margin = [16, 16]; // Standard spacing on desktop
					}

					// Calculate row height to make 1x1 widgets square
					// Row height = (container width - total horizontal margins) / number of columns
					const totalHorizontalMargin = margin[0] * (nextCols - 1);
					const columnWidth = (containerWidth - totalHorizontalMargin) / nextCols;

					// Set row height equal to column width for square 1x1 widgets
					setRowHeight(columnWidth);
					setGridMargin(margin);
				}
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [modules]);

	// Recompute layout when cols changes to ensure proper grid display
	useEffect(() => {
		if (modules.length > 0 && cols > 0) {
			const newLayout = computeLayoutForCols(modules, cols);
			setLayout(newLayout);

			// Update desktop ref if we're in desktop mode
			if (cols === GRID_COLS) {
				desktopLayoutRef.current = newLayout;
			}
		}
	}, [cols, modules]);

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
								? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
								: 'border-border bg-background hover:bg-accent'
								}`}
						>
							<span>Edit</span>
						</button>
					</div>
				</div>

				<div className="layout-shell px-2 sm:px-0">
					<ReactGridLayout
						key={`grid-${cols}`}
						className="layout"
						cols={cols}
						rowHeight={rowHeight}
						margin={gridMargin}
						containerPadding={[0, gridMargin[1]]}
						compactType={null}
						preventCollision={false}
						allowOverlap={false}
						layout={layout.filter((item, index, self) =>
							index === self.findIndex(t => t.i === item.i)
						)}
						onLayoutChange={handleLayoutChange}
						onResizeStop={(layout, oldItem, newItem) => {
							// Enforce valid widget sizes: snap to 1x1, 1x2, 2x1, or 2x2
							const validW = newItem.w >= 1.5 ? 2 : 1;
							const validH = newItem.h >= 1.5 ? 2 : 1;

							if (newItem.w !== validW || newItem.h !== validH) {
								const correctedLayout = layout.map(item =>
									item.i === newItem.i
										? { ...item, w: validW, h: validH }
										: item
								);
								handleLayoutChange(correctedLayout);
							} else {
								handleLayoutChange(layout);
							}
						}}
						draggableHandle=".dashboard-module-drag-handle"
						isResizable={isEditMode}
						isDraggable={isEditMode}
						resizeHandles={['se']}
						resizeHandle={<div className="react-resizable-handle react-resizable-handle-se" />}
					>
						{modules.map((module) => {
							const metricConfig = METRIC_CONFIGS[module.title] ?? DEFAULT_METRIC;
							const HeaderIcon = metricConfig.icon;

							return (
								<div key={module.id} className="overflow-visible">
									<DashboardCard className={`h-full min-h-[160px] flex flex-col relative p-4 sm:p-5 ${isEditMode ? 'animate-wiggle [backface-visibility:hidden] [transform-style:preserve-3d] [will-change:transform] [-webkit-font-smoothing:antialiased] [filter:blur(0)]' : ''}`}>
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

										{isEditMode && (
											<button
												type="button"
												onClick={() => handleRemoveModule(module.id)}
												className="absolute -top-2 -right-2 z-30 h-7 w-7 flex items-center justify-center text-white bg-black hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 transition-colors rounded-full shadow-lg border-2 border-white dark:border-black"
												aria-label="Remove widget"
											>
												<X className="h-4 w-4" />
											</button>
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
											{!isEditMode && (
												<>
													<button
														type="button"
														onClick={() =>
															setMenuForId((current) =>
																current === module.id ? null : module.id,
															)
														}
														className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
														aria-label="Widget settings"
													>
														<MoreVertical className="h-4 w-4" />
													</button>
													{menuForId === module.id && (() => {
														// Special handling for Pinned Links widget
														if (module.title === "Pinned Links") {
															const selectedSlugs = module.settings?.selectedSlugs || [];
															console.log("[Pinned Links Render] Selected slugs:", selectedSlugs);
															console.log("[Pinned Links Render] Available links:", availableLinks.map(l => l.slug));
															return (
																<div className="absolute right-4 top-16 z-50 w-64 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl text-xs overflow-hidden max-h-96 flex flex-col">
																	<div className="p-3 border-b border-gray-200 dark:border-white/10">
																		<h4 className="text-xs font-semibold text-foreground">Select Links to Display</h4>
																		<p className="text-[10px] text-muted-foreground mt-1">
																			Choose which links to show (max 8)
																		</p>
																	</div>
																	<div className="py-2 overflow-y-auto">
																		{availableLinks.length === 0 ? (
																			<div className="px-3 py-4 text-center text-muted-foreground text-xs">
																				No links available
																			</div>
																		) : (
																			availableLinks.map((link) => {
																				const isSelected = selectedSlugs.includes(link.slug);
																				console.log(`[Checkbox Render] slug="${link.slug}", isSelected=${isSelected}, selectedSlugs=`, selectedSlugs);
																				return (
																					<button
																						key={link.slug}
																						type="button"
																						onClick={() => handleToggleLinkSelection(module.id, link.slug)}
																						className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
																					>
																						<div
																							className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
																							style={{
																								backgroundColor: isSelected ? '#3b82f6' : 'transparent',
																								borderColor: isSelected ? '#3b82f6' : '#d1d5db',
																							}}
																						>
																							{isSelected && (
																								<svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
																									<path d="M5 13l4 4L19 7"></path>
																								</svg>
																							)}
																						</div>
																						<div className="flex-1 text-left truncate">
																							<div className="font-medium truncate">/{link.slug}</div>
																							{link.name !== link.slug && (
																								<div className="text-[10px] text-muted-foreground truncate">{link.name}</div>
																							)}
																						</div>
																					</button>
																				);
																			})
																		)}
																	</div>
																	<div className="p-2 border-t border-gray-200 dark:border-white/10">
																		<button
																			type="button"
																			onClick={() => setMenuForId(null)}
																			className="w-full px-3 py-1.5 text-xs font-medium text-foreground bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
																		>
																			Close
																		</button>
																	</div>
																</div>
															);
														}

														// Settings menu based on widget type
														const widgetType = getWidgetType(module.title);

														// Campaign selection menu
														if (widgetType === "campaign") {
															const selectedCampaign = module.settings?.selectedCampaign;
															return (
																<div className="absolute right-4 top-16 z-50 w-64 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl text-xs overflow-hidden max-h-96 flex flex-col">
																	<div className="p-3 border-b border-gray-200 dark:border-white/10">
																		<h4 className="text-xs font-semibold text-foreground">Select Campaign</h4>
																		<p className="text-[10px] text-muted-foreground mt-1">
																			Choose a specific campaign to display
																		</p>
																	</div>
																	<div className="py-2 overflow-y-auto">
																		<button
																			type="button"
																			onClick={() => handleSelectCampaign(module.id, "")}
																			className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${!selectedCampaign ? 'text-blue-500 font-medium' : 'text-foreground'
																				}`}
																		>
																			<span>Top Campaign (Default)</span>
																			{!selectedCampaign && <span className="text-xs">✓</span>}
																		</button>
																		{availableCampaigns.length === 0 ? (
																			<div className="px-3 py-4 text-center text-muted-foreground text-xs">
																				No campaigns available
																			</div>
																		) : (
																			availableCampaigns.map((campaign) => (
																				<button
																					key={campaign}
																					type="button"
																					onClick={() => handleSelectCampaign(module.id, campaign)}
																					className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${selectedCampaign === campaign ? 'text-blue-500 font-medium' : 'text-foreground'
																						}`}
																				>
																					<span className="truncate">{campaign}</span>
																					{selectedCampaign === campaign && <span className="text-xs">✓</span>}
																				</button>
																			))
																		)}
																	</div>
																	<div className="p-2 border-t border-gray-200 dark:border-white/10">
																		<button
																			type="button"
																			onClick={() => setMenuForId(null)}
																			className="w-full px-3 py-1.5 text-xs font-medium text-foreground bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
																		>
																			Close
																		</button>
																	</div>
																</div>
															);
														}

														// Source selection menu
														if (widgetType === "source") {
															const selectedSource = module.settings?.selectedSource;
															return (
																<div className="absolute right-4 top-16 z-50 w-64 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl text-xs overflow-hidden max-h-96 flex flex-col">
																	<div className="p-3 border-b border-gray-200 dark:border-white/10">
																		<h4 className="text-xs font-semibold text-foreground">Select Source</h4>
																		<p className="text-[10px] text-muted-foreground mt-1">
																			Choose a specific UTM source to display
																		</p>
																	</div>
																	<div className="py-2 overflow-y-auto">
																		<button
																			type="button"
																			onClick={() => handleSelectSource(module.id, "")}
																			className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${!selectedSource ? 'text-blue-500 font-medium' : 'text-foreground'
																				}`}
																		>
																			<span>Top Source (Default)</span>
																			{!selectedSource && <span className="text-xs">✓</span>}
																		</button>
																		{availableSources.length === 0 ? (
																			<div className="px-3 py-4 text-center text-muted-foreground text-xs">
																				No sources available
																			</div>
																		) : (
																			availableSources.map((source) => (
																				<button
																					key={source}
																					type="button"
																					onClick={() => handleSelectSource(module.id, source)}
																					className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${selectedSource === source ? 'text-blue-500 font-medium' : 'text-foreground'
																						}`}
																				>
																					<span className="truncate">{source}</span>
																					{selectedSource === source && <span className="text-xs">✓</span>}
																				</button>
																			))
																		)}
																	</div>
																	<div className="p-2 border-t border-gray-200 dark:border-white/10">
																		<button
																			type="button"
																			onClick={() => setMenuForId(null)}
																			className="w-full px-3 py-1.5 text-xs font-medium text-foreground bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
																		>
																			Close
																		</button>
																	</div>
																</div>
															);
														}

														// Product selection menu
														if (widgetType === "product") {
															const selectedProduct = module.settings?.selectedProduct;
															return (
																<div className="absolute right-4 top-16 z-50 w-64 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl text-xs overflow-hidden max-h-96 flex flex-col">
																	<div className="p-3 border-b border-gray-200 dark:border-white/10">
																		<h4 className="text-xs font-semibold text-foreground">Select Product</h4>
																		<p className="text-[10px] text-muted-foreground mt-1">
																			Choose a specific product to display
																		</p>
																	</div>
																	<div className="py-2 overflow-y-auto">
																		<button
																			type="button"
																			onClick={() => handleSelectProduct(module.id, "")}
																			className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${!selectedProduct ? 'text-blue-500 font-medium' : 'text-foreground'
																				}`}
																		>
																			<span>Top Product (Default)</span>
																			{!selectedProduct && <span className="text-xs">✓</span>}
																		</button>
																		{availableProducts.length === 0 ? (
																			<div className="px-3 py-4 text-center text-muted-foreground text-xs">
																				No products available
																			</div>
																		) : (
																			availableProducts.map((product) => (
																				<button
																					key={product}
																					type="button"
																					onClick={() => handleSelectProduct(module.id, product)}
																					className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${selectedProduct === product ? 'text-blue-500 font-medium' : 'text-foreground'
																						}`}
																				>
																					<span className="truncate">{product}</span>
																					{selectedProduct === product && <span className="text-xs">✓</span>}
																				</button>
																			))
																		)}
																	</div>
																	<div className="p-2 border-t border-gray-200 dark:border-white/10">
																		<button
																			type="button"
																			onClick={() => setMenuForId(null)}
																			className="w-full px-3 py-1.5 text-xs font-medium text-foreground bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
																		>
																			Close
																		</button>
																	</div>
																</div>
															);
														}

														// Destination selection menu
														if (widgetType === "destination") {
															const selectedDestination = module.settings?.selectedDestination;
															return (
																<div className="absolute right-4 top-16 z-50 w-64 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl text-xs overflow-hidden max-h-96 flex flex-col">
																	<div className="p-3 border-b border-gray-200 dark:border-white/10">
																		<h4 className="text-xs font-semibold text-foreground">Select Destination</h4>
																		<p className="text-[10px] text-muted-foreground mt-1">
																			Choose a specific destination URL to display
																		</p>
																	</div>
																	<div className="py-2 overflow-y-auto">
																		<button
																			type="button"
																			onClick={() => handleSelectDestination(module.id, "")}
																			className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${!selectedDestination ? 'text-blue-500 font-medium' : 'text-foreground'
																				}`}
																		>
																			<span>Top Destination (Default)</span>
																			{!selectedDestination && <span className="text-xs">✓</span>}
																		</button>
																		{availableDestinations.length === 0 ? (
																			<div className="px-3 py-4 text-center text-muted-foreground text-xs">
																				No destinations available
																			</div>
																		) : (
																			availableDestinations.map((destination) => (
																				<button
																					key={destination}
																					type="button"
																					onClick={() => handleSelectDestination(module.id, destination)}
																					className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${selectedDestination === destination ? 'text-blue-500 font-medium' : 'text-foreground'
																						}`}
																				>
																					<span className="truncate text-left">{destination}</span>
																					{selectedDestination === destination && <span className="text-xs ml-2">✓</span>}
																				</button>
																			))
																		)}
																	</div>
																	<div className="p-2 border-t border-gray-200 dark:border-white/10">
																		<button
																			type="button"
																			onClick={() => setMenuForId(null)}
																			className="w-full px-3 py-1.5 text-xs font-medium text-foreground bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
																		>
																			Close
																		</button>
																	</div>
																</div>
															);
														}

														// Time period selection menu for metrics
														if (widgetType === "timePeriod") {
															const selectedPeriod = module.settings?.timePeriod || "Last 30 Days";
															return (
																<div className="absolute right-4 top-16 z-50 w-56 rounded-xl bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl text-xs overflow-hidden">
																	<div className="p-3 border-b border-gray-200 dark:border-white/10">
																		<h4 className="text-xs font-semibold text-foreground">Time Period</h4>
																		<p className="text-[10px] text-muted-foreground mt-1">
																			Select data time range
																		</p>
																	</div>
																	<div className="py-2">
																		{TIME_PERIOD_OPTIONS.map((period) => (
																			<button
																				key={period}
																				type="button"
																				onClick={() => handleSelectTimePeriod(module.id, period)}
																				className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${selectedPeriod === period ? 'text-blue-500 font-medium' : 'text-foreground'
																					}`}
																			>
																				<span>{period}</span>
																				{selectedPeriod === period && <span className="text-xs">✓</span>}
																			</button>
																		))}
																	</div>
																	<div className="p-2 border-t border-gray-200 dark:border-white/10">
																		<button
																			type="button"
																			onClick={() => setMenuForId(null)}
																			className="w-full px-3 py-1.5 text-xs font-medium text-foreground bg-gray-100 dark:bg-white/5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
																		>
																			Close
																		</button>
																	</div>
																</div>
															);
														}

														// No settings menu for other widgets
														return null;
													})()}
												</>
											)}
										</div>

										<div className="flex-1 flex flex-col justify-center">
											{/* Overview Metrics */}
											{module.title === "Revenue Overview" ? (
												<RevenueOverview size={module.size} timePeriod={module.settings?.timePeriod} />
											) : module.title === "Active Links" ? (
												<ActiveLinks />
											) : /* UTM Performance */
												module.title === "Campaign Performance" ? (
													<CampaignPerformanceTable size={module.size} />
												) : module.title === "Source Performance" ? (
													<SourcePerformanceTable size={module.size} />
												) : module.title === "Product Performance" ? (
													<ProductPerformanceTable size={module.size} />
												) : module.title === "Destination Analysis" ? (
													<DestinationAnalysisTable size={module.size} />
												) : module.title === "UTM Funnel" ? (
													<UTMFunnel />
												) : /* Device & Geo Analytics */
													module.title === "Device Breakdown" ? (
														<DeviceBreakdownCard size={module.size} />
													) : module.title === "Browser Analytics" ? (
														<BrowserAnalytics />
													) : module.title === "OS Distribution" ? (
														<OSDistribution />
													) : module.title === "Geographic Overview" ? (
														<GeographicOverview />
													) : module.title === "Mobile vs Desktop" ? (
														<MobileVsDesktop />
													) : module.title === "Traffic Quality" ? (
														<TrafficQuality />
													) : /* Time Intelligence */
														module.title === "Today's Snapshot" ? (
															<TodaysSnapshot />
														) : module.title === "Weekly Performance" ? (
															<WeeklyPerformance size={module.size} />
														) : module.title === "Peak Hours" ? (
															<PeakHours />
														) : /* Links & Tracking */
															module.title === "Pinned Links" ? (
																<PinnedLinksWidget selectedSlugs={module.settings?.selectedSlugs} />
															) : (
																/* Default: Metric cards and charts */
																<MetricCardContent
																	title={module.title}
																	overview={getWidgetOverviewMetrics(
																		links,
																		events,
																		orders,
																		module.settings?.timePeriod
																	)}
																/>
															)}
										</div>

										{isEditMode && (
											<div className="pointer-events-none absolute inset-0">
												<div className="absolute bottom-0.5 right-0.5 w-3 h-3">
													<div className="w-full h-full border-b-[3px] border-r-[2px] border-slate-400/80 rounded-br-full" />
												</div>
											</div>
										)}
									</DashboardCard>
								</div>
							);
						})}
					</ReactGridLayout>
				</div>

				{isPickerOpen && (
					<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
						<div className="mx-4 w-full max-w-5xl max-h-[90vh] rounded-2xl bg-white dark:bg-[#121212] shadow-xl overflow-hidden flex flex-col">
							<div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212]">
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

							<div className="overflow-y-auto flex-1 p-6">
								<div className="space-y-8">
									{Object.entries(WIDGET_CATEGORIES).map(([category, widgets]) => (
										<div key={category} className="mb-6">
											<h3 className="text-sm font-semibold text-foreground mb-4">{category}</h3>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
												{widgets.map((title) => {
													const config = METRIC_CONFIGS[title] ?? DEFAULT_METRIC;
													const Icon = config.icon;
													const isAdded = modules.some(m => m.title === title);
													const widgetSize = getWidgetDefaultSize(title);

													// Determine preview dimensions based on widget size
													const previewHeight = widgetSize === "1x2" || widgetSize === "2x2" ? "h-96" : "h-48";
													const previewWidth = widgetSize === "2x1" || widgetSize === "2x2" ? "col-span-2" : "col-span-1";

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
															className={`group relative text-left w-full ${previewWidth}`}
														>
															<DashboardCard className={`${previewHeight} flex flex-col relative p-4 transition-all ${isAdded ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-blue-500/50'}`}>
																{isAdded && (
																	<div className="absolute top-2 right-2 z-10">
																		<div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
																			<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
																			</svg>
																		</div>
																	</div>
																)}
																<div className="flex items-start gap-2.5 mb-3 flex-shrink-0">
																	<div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
																		<Icon className="h-3.5 w-3.5 text-foreground/80" />
																	</div>
																	<div className="min-w-0">
																		<div className="text-xs font-semibold text-foreground truncate">
																			{title}
																		</div>
																		<div className="text-[10px] text-muted-foreground mt-0.5 truncate">
																			{config.subtitle}
																		</div>
																	</div>
																</div>
																<div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
																	{/* Overview Metrics */}
																	{title === "Revenue Overview" ? (
																		<RevenueOverview size={widgetSize} timePeriod="30D" />
																	) : title === "Active Links" ? (
																		<ActiveLinks />
																	) : /* UTM Performance */
																		title === "Campaign Performance" ? (
																			<CampaignPerformanceTable size={widgetSize} />
																		) : title === "Source Performance" ? (
																			<SourcePerformanceTable size={widgetSize} />
																		) : title === "Product Performance" ? (
																			<ProductPerformanceTable size={widgetSize} />
																		) : title === "Destination Analysis" ? (
																			<DestinationAnalysisTable size={widgetSize} />
																		) : title === "UTM Funnel" ? (
																			<UTMFunnel size={widgetSize} />
																		) : /* Device & Geo Analytics */
																			title === "Device Breakdown" ? (
																				<DeviceBreakdownCard size={widgetSize} />
																			) : title === "Browser Analytics" ? (
																				<BrowserAnalytics size={widgetSize} />
																			) : title === "OS Distribution" ? (
																				<OSDistribution size={widgetSize} />
																			) : title === "Geographic Overview" ? (
																				<GeographicOverview size={widgetSize} />
																			) : title === "Mobile vs Desktop" ? (
																				<MobileVsDesktop size={widgetSize} />
																			) : title === "Traffic Quality" ? (
																				<TrafficQuality size={widgetSize} />
																			) : /* Time Intelligence */
																				title === "Today's Snapshot" ? (
																					<TodaysSnapshot size={widgetSize} />
																				) : title === "Weekly Performance" ? (
																					<WeeklyPerformance size={widgetSize} />
																				) : title === "Peak Hours" ? (
																					<PeakHours size={widgetSize} />
																				) : /* Links & Tracking */
																					title === "Pinned Links" ? (
																						<PinnedLinksWidget size={widgetSize} />
																					) : (
																						/* Default: Metric cards and charts */
																						<MetricCardContent
																							title={title}
																							overview={getWidgetOverviewMetrics(links, events, orders, "All Time")}
																						/>
																					)}
																</div>
															</DashboardCard>
														</button>
													);
												})}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				<Newsletter />
			</div>
		</div>
	);
}
