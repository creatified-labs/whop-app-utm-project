import React from "react";
import { Archive, Link2, Settings } from "lucide-react";
import type { TrackingLink, LinkMetrics } from "@/lib/utm/types";

export type VisibleColumns = {
	product: boolean;
	plan: boolean;
	url: boolean;
	destination: boolean;
	utmSource?: boolean;
	utmMedium?: boolean;
	utmCampaign?: boolean;
	dateCreated?: boolean;
	clicks: boolean;
	revenue: boolean;
	conversion: boolean;
	convertedUsers: boolean;
};

export function LinksTableRow({
	link,
	metrics,
	visibleColumns,
	columnWidths,
	mode = "whop",
	onArchiveLink,
	onRestoreLink,
	onDeleteLink,
	isArchivedView,
}: {
	link: TrackingLink;
	metrics?: LinkMetrics;
	visibleColumns: VisibleColumns;
	columnWidths: { name: number; product: number };
	mode?: "whop" | "advanced";
	onArchiveLink?: (id: string) => void;
	onRestoreLink?: (id: string) => void;
	onDeleteLink?: (id: string) => void;
	isArchivedView?: boolean;
}) {
	const {
		name,
		slug,
		product,
		destination,
		clicks: linkClicks,
		convertedUsers: linkConvertedUsers,
		revenueGenerated: linkRevenueGenerated,
		conversionRate: linkConversionRate,
	} = link;

	const clicks = metrics?.clicks ?? (mode === "advanced" ? linkClicks ?? 0 : 0);

	const revenue =
		metrics?.revenue ??
		(mode === "advanced" ? linkRevenueGenerated ?? 0 : 0);

	const convertedUsers =
		metrics?.orders ??
		(mode === "advanced" ? linkConvertedUsers ?? 0 : 0);

	const conversionRate =
		metrics?.conversionRate ??
		(mode === "advanced"
			? linkConversionRate ?? convertedUsers / Math.max(clicks || 1, 1)
			: 0);

	// Temporary plan label derived from product; this will be replaced with real plan data.
	const planLabel = `${product} plan`;

	const formattedRevenue = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(revenue);

	const formattedConversion = `${Math.round(conversionRate * 100)}%`;

	const shortUrl = `.../${slug}`;

	let trackingUrlForDisplay = shortUrl;
	if (mode === "advanced") {
		const envBase = process.env.NEXT_PUBLIC_WHOP_APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL;
		const origin =
			envBase ||
			(typeof window !== "undefined" && window.location.origin
				? window.location.origin
				: "");

		trackingUrlForDisplay = origin ? `${origin}/t/${slug}` : `/t/${slug}`;
	}

	const displayUrl = mode === "advanced" ? trackingUrlForDisplay : shortUrl;

	const destinationTag = (() => {
		const baseClass =
			"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border";

		let label: string | null = null;
		let className = baseClass;

		if (mode === "whop") {
			if (
				destination === "access_pass_page" ||
				destination === "store_page"
			) {
				label = "Store";
				className += " bg-[#102857] text-[#8fb4ff] border-[#264b93]";
			} else if (destination === "checkout_page") {
				label = "Checkout";
				className += " bg-[#00565d] text-[#4ee5ff] border-[#03919b]";
			}
		} else if (mode === "advanced") {
			const dest = (link.destination ?? "").toLowerCase();
			if (dest.includes("/checkout/")) {
				label = "Checkout";
				className += " bg-[#00565d] text-[#4ee5ff] border-[#03919b]";
			} else if (dest.includes("whop.com/")) {
				label = "Store";
				className += " bg-[#102857] text-[#8fb4ff] border-[#264b93]";
			}
		}

		return label ? { label, className } : null;
	})();

	const [copied, setCopied] = React.useState(false);
	const [isActionsOpen, setIsActionsOpen] = React.useState(false);

	const handleCopyUrl = () => {
		let urlToCopy: string | undefined;

		if (mode === "advanced") {
			// For advanced tracking links, copy the tracking URL that goes through
			// our /t/[slug] redirect so we can log clicks server-side.
			urlToCopy = displayUrl;
		} else {
			// For Whop links, keep copying the underlying tracking/destination URL
			// provided by Whop.
			urlToCopy = link.trackingUrl || link.destination;
		}

		if (!urlToCopy || typeof navigator === "undefined") return;

		if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
			navigator.clipboard.writeText(urlToCopy)
				.then(() => {
					setCopied(true);
					window.setTimeout(() => setCopied(false), 1500);
				})
				.catch(() => {
					// Best-effort copy; ignore errors for now.
				});
		}
	};

	return (
		<tr className="transition-colors hover:bg-card/60">
			{/* Name */}
			<td
				className="sticky left-0 z-10 px-4 py-3 align-top bg-card border-b border-transparent relative"
				style={{ width: columnWidths.name }}
			>
				<div className="flex flex-col gap-1 min-w-0">
					<div className="flex items-center gap-2 min-w-0">
						<span className="truncate font-medium text-foreground">
							{name}
						</span>
						{mode === "advanced" && link.metaPixelEnabled && (
							<span className="shrink-0 inline-flex items-center rounded-full border border-emerald-400/60 bg-emerald-400/5 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
								Meta Pixel
							</span>
						)}
					</div>
				</div>
			</td>

			{/* Product */}
			{visibleColumns.product && (
				<td
					className="sticky z-10 px-4 py-3 align-top text-sm text-muted-foreground bg-card border-b border-transparent relative"
					style={{
						width: columnWidths.product,
						left: columnWidths.name,
					}}
				>
					<div className="pr-2">
						<span className="block truncate">{product}</span>
					</div>
				</td>
			)}

			{/* Plan */}
			{visibleColumns.plan && (
				<td className="px-4 py-3 align-top text-sm text-muted-foreground border-b border-transparent">
					<span className="block truncate">{planLabel}</span>
				</td>
			)}

			{/* URL */}
			{visibleColumns.url && (
				<td className="px-4 py-3 align-top text-sm text-muted-foreground border-b border-transparent max-w-0 overflow-hidden">
					<div className="flex items-center gap-1 max-w-full">
						<span className="block truncate whitespace-nowrap">{displayUrl}</span>
						<button
							type="button"
							aria-label="Copy link"
							className="shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
							onClick={handleCopyUrl}
						>
							<Link2 className="h-3 w-3" />
						</button>
					</div>
					{copied && (
						<div className="mt-0.5 text-[10px] text-emerald-400">
							Link copied
						</div>
					)}
				</td>
			)}

			{/* Destination */}
			{visibleColumns.destination && (
				<td className="px-4 py-3 align-top border-b border-transparent max-w-0 overflow-hidden">
					<p className="truncate whitespace-nowrap text-sm text-muted-foreground">
						{destinationTag ? (
							<span className={destinationTag.className}>{destinationTag.label}</span>
						) : (
							destination
						)}
					</p>
				</td>
			)}

			{/* UTM source */}
			{mode === "advanced" && visibleColumns.utmSource && (
				<td className="px-4 py-3 align-top border-b border-transparent max-w-0 overflow-hidden">
					<span className="block truncate whitespace-nowrap text-sm text-muted-foreground">
						{link.utmSource ?? "—"}
					</span>
				</td>
			)}

			{/* UTM medium */}
			{mode === "advanced" && visibleColumns.utmMedium && (
				<td className="px-4 py-3 align-top border-b border-transparent max-w-0 overflow-hidden">
					<span className="block truncate whitespace-nowrap text-sm text-muted-foreground">
						{link.utmMedium ?? "—"}
					</span>
				</td>
			)}

			{/* UTM campaign */}
			{mode === "advanced" && visibleColumns.utmCampaign && (
				<td className="px-4 py-3 align-top border-b border-transparent max-w-0 overflow-hidden">
					<span className="block truncate whitespace-nowrap text-sm text-muted-foreground">
						{link.utmCampaign ?? "—"}
					</span>
				</td>
			)}

			{/* Date Created */}
			{mode === "advanced" && visibleColumns.dateCreated && (
				<td className="px-4 py-3 align-top border-b border-transparent max-w-0 overflow-hidden">
					<span className="block truncate whitespace-nowrap text-sm text-muted-foreground">
						{link.createdAt
							? new Date(link.createdAt).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})
							: "—"}
					</span>
				</td>
			)}

			{/* Clicks */}
			{visibleColumns.clicks && (
				<td className="px-4 py-3 align-top text-right text-sm tabular-nums text-foreground border-b border-transparent">
					{clicks.toLocaleString()}
				</td>
			)}

			{/* Revenue generated */}
			{visibleColumns.revenue && (
				<td className="px-4 py-3 align-top text-right text-sm tabular-nums text-foreground border-b border-transparent">
					{formattedRevenue}
				</td>
			)}

			{/* Conversion rate */}
			{visibleColumns.conversion && (
				<td className="px-4 py-3 align-top text-right text-sm tabular-nums text-muted-foreground border-b border-transparent">
					{formattedConversion}
				</td>
			)}

			{/* Converted users */}
			{visibleColumns.convertedUsers && (
				<td className="px-4 py-3 align-top text-right text-sm tabular-nums text-muted-foreground border-b border-transparent">
					{convertedUsers.toLocaleString()}
				</td>
			)}

			{/* Actions */}
			<td className="sticky right-0 z-10 w-12 px-4 py-3 align-middle text-right bg-card border-b border-transparent relative">
				<div className="flex justify-center gap-1.5 relative">
					{mode === "advanced" && !isArchivedView && onArchiveLink && (
						<button
							type="button"
							className="inline-flex h-6 aspect-square items-center justify-center rounded-full bg-transparent text-muted-foreground hover:bg-accent/40 dark:hover:bg-accent/60 transition-colors"
							onClick={() => onArchiveLink(link.id)}
						>
							<Archive className="h-3.5 w-3.5" />
						</button>
					)}

					{mode === "advanced" && isArchivedView && (onRestoreLink || onDeleteLink) && (
						<>
							<button
								type="button"
								className="inline-flex h-6 aspect-square items-center justify-center rounded-full bg-transparent text-muted-foreground hover:bg-accent/40 dark:hover:bg-accent/60 transition-colors"
								onClick={() => setIsActionsOpen((open) => !open)}
							>
								<Settings className="h-3.5 w-3.5" />
							</button>
							{isActionsOpen && (
								<div className="absolute right-0 top-8 z-40 w-44 rounded-xl border border-border bg-card text-foreground shadow-lg text-xs overflow-hidden">
									{onRestoreLink && (
										<button
											type="button"
											onClick={() => {
												onRestoreLink(link.id);
												setIsActionsOpen(false);
											}}
											className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-accent/60"
										>
											<span>Restore link</span>
										</button>
									)}
									{onDeleteLink && (
										<button
											type="button"
											onClick={() => {
												onDeleteLink(link.id);
												setIsActionsOpen(false);
											}}
											className="flex w-full items-center justify-between px-3 py-2 text-left text-red-400 hover:bg-red-500/10"
										>
											<span>Delete permanently</span>
										</button>
									)}
								</div>
							)}
						</>
					)}
				</div>
				<span className="pointer-events-none absolute left-0 top-0 bottom-0 w-[2px] bg-border" />
			</td>
		</tr>
	);
}
