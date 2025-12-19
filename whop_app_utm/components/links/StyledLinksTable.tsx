"use client";

import React, { useState } from "react";
import {
	Link2,
	Copy,
	Check,
	MoreHorizontal,
	Archive,
	Trash2,
	RotateCcw,
	ExternalLink,
	TrendingUp,
	MousePointerClick,
	DollarSign,
	Users,
	ArrowUpRight
} from "lucide-react";
import type { TrackingLink, LinkMetrics } from "@/lib/utm/types";
import { useUtmData, useLinkMetrics } from "@/lib/utm/hooks";

type LinksTableMode = "whop" | "advanced";

type StyledLinksTableProps = {
	mode?: LinksTableMode;
	linksOverride?: TrackingLink[];
	metricsOverride?: LinkMetrics[];
	onArchiveLink?: (id: string) => void;
	onRestoreLink?: (id: string) => void;
	onDeleteLink?: (id: string) => void;
	isArchivedView?: boolean;
	onLinkClick?: (link: TrackingLink, metrics?: LinkMetrics) => void;
};

function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

function formatNumber(value: number): string {
	return new Intl.NumberFormat("en-US").format(value);
}

function LinkRow({
	link,
	metrics,
	mode,
	onArchiveLink,
	onRestoreLink,
	onDeleteLink,
	isArchivedView,
	onLinkClick,
}: {
	link: TrackingLink;
	metrics?: LinkMetrics;
	mode: LinksTableMode;
	onArchiveLink?: (id: string) => void;
	onRestoreLink?: (id: string) => void;
	onDeleteLink?: (id: string) => void;
	isArchivedView?: boolean;
	onLinkClick?: () => void;
}) {
	const [copied, setCopied] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

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
		<div className="group relative">
			{/* Main card row */}
			<div className="relative rounded-xl bg-gray-50 dark:bg-white/[0.02] p-4 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:shadow-md hover:-translate-y-0.5">
				{/* Top section: Name and actions */}
				<div className="flex items-start justify-between gap-4 mb-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2">
							<h3 className="text-sm font-medium text-foreground truncate">
								{link.name}
							</h3>
							{/* View details button - only for advanced links */}
							{mode === "advanced" && (
								<button
									type="button"
									onClick={onLinkClick}
									className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
									title="View details"
								>
									<ArrowUpRight className="h-3.5 w-3.5" />
								</button>
							)}
							{mode === "advanced" && link.metaPixelEnabled && (
								<span className="shrink-0 inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
									Meta Pixel
								</span>
							)}
						</div>
						<p className="text-xs text-muted-foreground mt-0.5 truncate">
							{link.product}
						</p>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-1">
						<button
							type="button"
							onClick={(e) => { e.stopPropagation(); handleCopy(); }}
							className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
							title="Copy link"
						>
							{copied ? (
								<Check className="h-4 w-4 text-emerald-400" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</button>

						{mode === "advanced" && (
							<div className="relative">
								<button
									type="button"
									onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
									className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
								>
									<MoreHorizontal className="h-4 w-4" />
								</button>

								{menuOpen && (
									<>
										<div
											className="fixed inset-0 z-40"
											onClick={() => setMenuOpen(false)}
										/>
										<div className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/90 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
											{!isArchivedView && onArchiveLink && (
												<button
													type="button"
													onClick={() => {
														onArchiveLink(link.id);
														setMenuOpen(false);
													}}
													className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
												>
													<Archive className="h-3.5 w-3.5" />
													Archive link
												</button>
											)}
											{isArchivedView && onRestoreLink && (
												<button
													type="button"
													onClick={() => {
														onRestoreLink(link.id);
														setMenuOpen(false);
													}}
													className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
												>
													<RotateCcw className="h-3.5 w-3.5" />
													Restore link
												</button>
											)}
											{isArchivedView && onDeleteLink && (
												<button
													type="button"
													onClick={() => {
														onDeleteLink(link.id);
														setMenuOpen(false);
													}}
													className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
												>
													<Trash2 className="h-3.5 w-3.5" />
													Delete permanently
												</button>
											)}
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>

				{/* URL and destination row */}
				<div className="flex items-center gap-3 mb-4">
					<div className="flex-1 min-w-0 flex items-center gap-2">
						<Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
						<span className="text-xs text-muted-foreground truncate font-mono">
							{mode === "advanced" ? `/t/${link.slug}` : `.../${link.slug}`}
						</span>
					</div>
					<span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${destinationType === "checkout"
						? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
						: "bg-blue-500/10 text-blue-400 border-blue-500/20"
						}`}>
						{destinationType === "checkout" ? "Checkout" : "Store"}
					</span>
				</div>

				{/* UTM params for advanced mode */}
				{mode === "advanced" && (link.utmSource || link.utmMedium || link.utmCampaign) && (
					<div className="flex flex-wrap gap-1.5 mb-4">
						{link.utmSource && (
							<span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
								<span className="text-foreground/50 mr-1">source:</span>
								{link.utmSource}
							</span>
						)}
						{link.utmMedium && (
							<span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
								<span className="text-foreground/50 mr-1">medium:</span>
								{link.utmMedium}
							</span>
						)}
						{link.utmCampaign && (
							<span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
								<span className="text-foreground/50 mr-1">campaign:</span>
								{link.utmCampaign}
							</span>
						)}
					</div>
				)}

				{/* Stats grid */}
				<div className="grid grid-cols-4 gap-3">
					<div className="rounded-lg bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] p-2.5">
						<div className="flex items-center gap-1.5 mb-1">
							<MousePointerClick className="h-3 w-3 text-muted-foreground" />
							<span className="text-[10px] text-muted-foreground uppercase tracking-wider">Clicks</span>
						</div>
						<p className="text-sm font-semibold text-foreground tabular-nums">
							{formatNumber(clicks)}
						</p>
					</div>

					<div className="rounded-lg bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] p-2.5">
						<div className="flex items-center gap-1.5 mb-1">
							<DollarSign className="h-3 w-3 text-muted-foreground" />
							<span className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue</span>
						</div>
						<p className="text-sm font-semibold text-foreground tabular-nums">
							{formatCurrency(revenue)}
						</p>
					</div>

					<div className="rounded-lg bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] p-2.5">
						<div className="flex items-center gap-1.5 mb-1">
							<TrendingUp className="h-3 w-3 text-muted-foreground" />
							<span className="text-[10px] text-muted-foreground uppercase tracking-wider">CVR</span>
						</div>
						<p className="text-sm font-semibold text-foreground tabular-nums">
							{Math.round(conversionRate * 100)}%
						</p>
					</div>

					<div className="rounded-lg bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] p-2.5">
						<div className="flex items-center gap-1.5 mb-1">
							<Users className="h-3 w-3 text-muted-foreground" />
							<span className="text-[10px] text-muted-foreground uppercase tracking-wider">Converted</span>
						</div>
						<p className="text-sm font-semibold text-foreground tabular-nums">
							{formatNumber(convertedUsers)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export function StyledLinksTable({
	mode = "whop",
	linksOverride,
	metricsOverride,
	onArchiveLink,
	onRestoreLink,
	onDeleteLink,
	isArchivedView,
	onLinkClick,
}: StyledLinksTableProps) {
	const { links } = useUtmData();
	const linkMetrics = useLinkMetrics();

	const effectiveLinks = linksOverride ?? links;
	const effectiveMetrics = metricsOverride ?? linkMetrics;

	if (effectiveLinks.length === 0) {
		return (
			<div className="mt-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] p-12 text-center">
				<div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-4">
					<Link2 className="h-5 w-5 text-muted-foreground" />
				</div>
				<h3 className="text-sm font-medium text-foreground mb-1">No links yet</h3>
				<p className="text-xs text-muted-foreground">
					Create your first tracking link to get started
				</p>
			</div>
		);
	}

	return (
		<div className="mt-4 space-y-3">
			{effectiveLinks.map((link) => {
				const metrics = effectiveMetrics.find((m) => m.linkId === link.id);
				return (
					<LinkRow
						key={link.id}
						link={link}
						metrics={metrics}
						mode={mode}
						onArchiveLink={onArchiveLink}
						onRestoreLink={onRestoreLink}
						onDeleteLink={onDeleteLink}
						isArchivedView={isArchivedView}
						onLinkClick={() => onLinkClick?.(link, metrics)}
					/>
				);
			})}
		</div>
	);
}
