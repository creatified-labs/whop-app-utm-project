"use client";

import React, { useState, useEffect } from "react";
import {
	X,
	Link2,
	Copy,
	Check,
	ExternalLink,
	MousePointerClick,
	DollarSign,
	TrendingUp,
	Users,
	Calendar,
	Tag,
	Globe,
	Smartphone,
	Monitor,
	Clock,
	ArrowUpRight,
	ShoppingCart,
} from "lucide-react";
import type { TrackingLink, LinkMetrics, VisitorEvent, Order } from "@/lib/utm/types";

type LinkDetailsModalProps = {
	link: TrackingLink;
	metrics?: LinkMetrics;
	onClose: () => void;
	mode?: "whop" | "advanced";
};

function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

function formatNumber(value: number): string {
	return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatDateTime(dateString: string): string {
	return new Date(dateString).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

type LinkActivity = {
	events: VisitorEvent[];
	orders: Order[];
	deviceBreakdown: { device: string; count: number }[];
	hourlyClicks: { hour: number; count: number }[];
};

export function LinkDetailsModal({ link, metrics, onClose, mode = "advanced" }: LinkDetailsModalProps) {
	const [copied, setCopied] = useState(false);
	const [activeTab, setActiveTab] = useState<"overview" | "activity" | "conversions">("overview");
	const [activity, setActivity] = useState<LinkActivity | null>(null);
	const [loadingActivity, setLoadingActivity] = useState(false);

	const clicks = metrics?.clicks ?? link.clicks ?? 0;
	const revenue = metrics?.revenue ?? link.revenueGenerated ?? 0;
	const convertedUsers = metrics?.orders ?? link.convertedUsers ?? 0;
	const conversionRate = metrics?.conversionRate ?? link.conversionRate ?? (clicks > 0 ? convertedUsers / clicks : 0);

	const getTrackingUrl = () => {
		if (mode === "advanced") {
			const envBase = process.env.NEXT_PUBLIC_WHOP_APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL;
			const origin = envBase || (typeof window !== "undefined" ? window.location.origin : "");
			return origin ? `${origin}/t/${link.slug}` : `/t/${link.slug}`;
		}
		return link.trackingUrl || link.destination;
	};

	const handleCopy = async () => {
		const url = getTrackingUrl();
		if (!url) return;

		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Ignore clipboard errors
		}
	};

	// Load activity data for this link
	useEffect(() => {
		const loadActivity = async () => {
			setLoadingActivity(true);
			try {
				const res = await fetch(`/api/link-activity?linkId=${encodeURIComponent(link.id)}`);
				if (res.ok) {
					const data = await res.json();
					setActivity(data);
				}
			} catch {
				// Silently fail - activity data is optional
			} finally {
				setLoadingActivity(false);
			}
		};

		loadActivity();
	}, [link.id]);

	const destinationType = (() => {
		if (mode === "whop") {
			if (link.destination === "checkout_page") return "checkout";
			return "store";
		}
		const dest = (link.destination ?? "").toLowerCase();
		if (dest.includes("/checkout/")) return "checkout";
		return "store";
	})();

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
			<div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col">
				{/* Header */}
				<div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-200 dark:border-white/10">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h2 className="text-lg font-semibold text-foreground truncate">
								{link.name}
							</h2>
							{mode === "advanced" && link.metaPixelEnabled && (
								<span className="shrink-0 inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
									Meta Pixel
								</span>
							)}
						</div>
						<p className="text-sm text-muted-foreground">{link.product}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex items-center gap-1 px-6 py-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
					{(["overview", "activity", "conversions"] as const).map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
									? "bg-white dark:bg-white/10 text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5"
								}`}
						>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
						</button>
					))}
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{activeTab === "overview" && (
						<div className="space-y-6">
							{/* Stats Grid */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								<div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4">
									<div className="flex items-center gap-2 mb-2">
										<MousePointerClick className="h-4 w-4 text-blue-500" />
										<span className="text-xs text-muted-foreground uppercase tracking-wider">Clicks</span>
									</div>
									<p className="text-2xl font-bold text-foreground tabular-nums">
										{formatNumber(clicks)}
									</p>
								</div>

								<div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4">
									<div className="flex items-center gap-2 mb-2">
										<DollarSign className="h-4 w-4 text-emerald-500" />
										<span className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</span>
									</div>
									<p className="text-2xl font-bold text-foreground tabular-nums">
										{formatCurrency(revenue)}
									</p>
								</div>

								<div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4">
									<div className="flex items-center gap-2 mb-2">
										<TrendingUp className="h-4 w-4 text-purple-500" />
										<span className="text-xs text-muted-foreground uppercase tracking-wider">CVR</span>
									</div>
									<p className="text-2xl font-bold text-foreground tabular-nums">
										{(conversionRate * 100).toFixed(1)}%
									</p>
								</div>

								<div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4">
									<div className="flex items-center gap-2 mb-2">
										<Users className="h-4 w-4 text-orange-500" />
										<span className="text-xs text-muted-foreground uppercase tracking-wider">Converted</span>
									</div>
									<p className="text-2xl font-bold text-foreground tabular-nums">
										{formatNumber(convertedUsers)}
									</p>
								</div>
							</div>

							{/* Link Details */}
							<div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4 space-y-4">
								<h3 className="text-sm font-semibold text-foreground">Link Details</h3>

								{/* Tracking URL */}
								<div className="flex items-center justify-between gap-3 py-2 border-b border-gray-200 dark:border-white/10">
									<div className="flex items-center gap-2 min-w-0">
										<Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
										<span className="text-sm text-muted-foreground">Tracking URL</span>
									</div>
									<div className="flex items-center gap-2">
										<code className="text-xs text-foreground bg-gray-100 dark:bg-white/10 px-2 py-1 rounded truncate max-w-[200px]">
											{getTrackingUrl()}
										</code>
										<button
											type="button"
											onClick={handleCopy}
											className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
										>
											{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
										</button>
									</div>
								</div>

								{/* Destination */}
								<div className="flex items-center justify-between gap-3 py-2 border-b border-gray-200 dark:border-white/10">
									<div className="flex items-center gap-2">
										<ExternalLink className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">Destination</span>
									</div>
									<div className="flex items-center gap-2">
										<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${destinationType === "checkout"
												? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
												: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
											}`}>
											{destinationType === "checkout" ? "Checkout" : "Store"}
										</span>
									</div>
								</div>

								{/* Created Date */}
								<div className="flex items-center justify-between gap-3 py-2 border-b border-gray-200 dark:border-white/10">
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">Created</span>
									</div>
									<span className="text-sm text-foreground">{formatDate(link.createdAt)}</span>
								</div>

								{/* UTM Parameters (for advanced links) */}
								{mode === "advanced" && (link.utmSource || link.utmMedium || link.utmCampaign) && (
									<div className="pt-2">
										<div className="flex items-center gap-2 mb-3">
											<Tag className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm text-muted-foreground">UTM Parameters</span>
										</div>
										<div className="flex flex-wrap gap-2">
											{link.utmSource && (
												<span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs">
													<span className="text-muted-foreground mr-1.5">source:</span>
													<span className="text-foreground font-medium">{link.utmSource}</span>
												</span>
											)}
											{link.utmMedium && (
												<span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs">
													<span className="text-muted-foreground mr-1.5">medium:</span>
													<span className="text-foreground font-medium">{link.utmMedium}</span>
												</span>
											)}
											{link.utmCampaign && (
												<span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-1 text-xs">
													<span className="text-muted-foreground mr-1.5">campaign:</span>
													<span className="text-foreground font-medium">{link.utmCampaign}</span>
												</span>
											)}
										</div>
									</div>
								)}
							</div>

							{/* Device Breakdown */}
							{activity?.deviceBreakdown && activity.deviceBreakdown.length > 0 && (
								<div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] p-4">
									<h3 className="text-sm font-semibold text-foreground mb-4">Device Breakdown</h3>
									<div className="space-y-3">
										{activity.deviceBreakdown.map((item) => {
											const total = activity.deviceBreakdown.reduce((sum, d) => sum + d.count, 0);
											const percentage = total > 0 ? (item.count / total) * 100 : 0;
											const Icon = item.device.toLowerCase().includes("mobile") ? Smartphone : Monitor;

											return (
												<div key={item.device} className="flex items-center gap-3">
													<Icon className="h-4 w-4 text-muted-foreground shrink-0" />
													<div className="flex-1 min-w-0">
														<div className="flex items-center justify-between mb-1">
															<span className="text-sm text-foreground">{item.device}</span>
															<span className="text-sm text-muted-foreground">{item.count} ({percentage.toFixed(0)}%)</span>
														</div>
														<div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
															<div
																className="h-full bg-blue-500 rounded-full transition-all"
																style={{ width: `${percentage}%` }}
															/>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === "activity" && (
						<div className="space-y-4">
							{loadingActivity ? (
								<div className="flex items-center justify-center py-12">
									<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
								</div>
							) : activity?.events && activity.events.length > 0 ? (
								<div className="space-y-2">
									{activity.events.slice(0, 50).map((event) => (
										<div
											key={event.id}
											className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06]"
										>
											<div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${event.type === "click" ? "bg-blue-500/10 text-blue-500" :
													event.type === "checkout_start" ? "bg-purple-500/10 text-purple-500" :
														"bg-gray-500/10 text-gray-500"
												}`}>
												{event.type === "click" ? <MousePointerClick className="h-4 w-4" /> :
													event.type === "checkout_start" ? <ShoppingCart className="h-4 w-4" /> :
														<Globe className="h-4 w-4" />}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-foreground capitalize">
													{event.type.replace("_", " ")}
												</p>
												<p className="text-xs text-muted-foreground">
													Visitor {event.visitorId.slice(0, 8)}...
												</p>
											</div>
											<div className="text-right">
												<p className="text-xs text-muted-foreground">
													{formatDateTime(event.occurredAt)}
												</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 mb-4">
										<Clock className="h-5 w-5 text-muted-foreground" />
									</div>
									<h3 className="text-sm font-medium text-foreground mb-1">No activity yet</h3>
									<p className="text-xs text-muted-foreground">
										Activity will appear here once visitors start clicking this link
									</p>
								</div>
							)}
						</div>
					)}

					{activeTab === "conversions" && (
						<div className="space-y-4">
							{loadingActivity ? (
								<div className="flex items-center justify-center py-12">
									<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
								</div>
							) : activity?.orders && activity.orders.length > 0 ? (
								<div className="space-y-2">
									{activity.orders.map((order) => (
										<div
											key={order.id}
											className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06]"
										>
											<div className="shrink-0 h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
												<ArrowUpRight className="h-4 w-4 text-emerald-500" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-foreground">
													{order.product}
												</p>
												<p className="text-xs text-muted-foreground">
													Order #{order.id.slice(0, 8)}...
												</p>
											</div>
											<div className="text-right">
												<p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
													{formatCurrency(order.amount)}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatDate(order.createdAt)}
												</p>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 mb-4">
										<ShoppingCart className="h-5 w-5 text-muted-foreground" />
									</div>
									<h3 className="text-sm font-medium text-foreground mb-1">No conversions yet</h3>
									<p className="text-xs text-muted-foreground">
										Conversions will appear here once visitors make purchases through this link
									</p>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
					<a
						href={link.destination}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ExternalLink className="h-3.5 w-3.5" />
						View destination
					</a>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex items-center justify-center rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
