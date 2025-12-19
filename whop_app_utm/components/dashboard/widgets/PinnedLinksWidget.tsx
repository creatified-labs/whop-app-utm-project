"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Pin, TrendingUp, MousePointerClick } from "lucide-react";

interface LinkData {
	id: string;
	slug: string;
	destination: string;
	clicks: number;
	convertedUsers: number;
	revenueGenerated: number;
	isPinned?: boolean;
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface PinnedLinksWidgetProps {
	selectedSlugs?: string[];
	size?: ModuleSize;
}

export function PinnedLinksWidget({ selectedSlugs, size }: PinnedLinksWidgetProps = {}) {
	const [links, setLinks] = useState<LinkData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchLinks = async () => {
			try {
				// Fetch both Whop tracking links and advanced links in parallel
				const [whopRes, advancedRes] = await Promise.all([
					fetch("/api/tracking-links"),
					fetch("/api/advanced-links-data"),
				]);

				const whopData = whopRes.ok ? await whopRes.json() : { links: [] };
				const advancedData = advancedRes.ok ? await advancedRes.json() : { links: [] };

				// Merge links from both sources
				const allLinks = [
					...(Array.isArray(whopData.links) ? whopData.links : []),
					...(Array.isArray(advancedData.links) ? advancedData.links : []),
				];

				// Only show pinned/selected links
				const filteredLinks = (selectedSlugs && selectedSlugs.length > 0)
					? allLinks.filter((link: LinkData) => selectedSlugs.includes(link.slug)).slice(0, 8)
					: [];

				setLinks(filteredLinks);
			} catch (error) {
				console.error("Failed to fetch links:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchLinks();
	}, [selectedSlugs]);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading links...</div>
			</div>
		);
	}

	if (links.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-center p-4">
				<Pin className="h-8 w-8 text-muted-foreground mb-2" />
				<div className="text-sm font-medium text-foreground">No pinned links yet</div>
				<div className="text-xs text-muted-foreground mt-1">
					Pin your top tracking links to see them here
				</div>
			</div>
		);
	}

	return (
		<div className="h-full overflow-auto">
			<div className="grid grid-cols-1 gap-2">
				{links.map((link) => (
					<div
						key={link.id}
						className="flex items-center justify-between p-3 rounded-lg bg-accent/40 hover:bg-accent/60 transition-colors border border-white/5"
					>
						<div className="flex-1 min-w-0 mr-3">
							<div className="flex items-center gap-2 mb-1">
								{link.isPinned && (
									<Pin className="h-3 w-3 text-blue-400 shrink-0" />
								)}
								<div className="text-sm font-semibold text-foreground truncate">
									/{link.slug}
								</div>
							</div>
							<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
								<ExternalLink className="h-3 w-3 shrink-0" />
								<span className="truncate">{link.destination}</span>
							</div>
						</div>

						<div className="flex items-center gap-4 shrink-0">
							<div className="text-right">
								<div className="flex items-center gap-1 text-xs font-bold text-foreground">
									<MousePointerClick className="h-3 w-3" />
									<span>{link.clicks.toLocaleString()}</span>
								</div>
								<div className="text-[9px] text-muted-foreground uppercase tracking-wide">
									Clicks
								</div>
							</div>

							{link.revenueGenerated > 0 && (
								<div className="text-right">
									<div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
										<TrendingUp className="h-3 w-3" />
										<span>${link.revenueGenerated.toFixed(0)}</span>
									</div>
									<div className="text-[9px] text-muted-foreground uppercase tracking-wide">
										Revenue
									</div>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
