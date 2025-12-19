"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { LinksToolbar } from "@/components/links/LinksToolbar";
import { StyledLinksTable } from "@/components/links/StyledLinksTable";
import { LinksTable } from "@/components/links/LinksTable";
import type { TrackingLink, LinkMetrics } from "@/lib/utm/types";
import { LinkDetailsModal } from "@/components/links/LinkDetailsModal";
import { useCurrentPlan } from "@/lib/useCurrentPlan";
import { formatLimit } from "@/lib/plans";
import { FrostedInput } from "@/components/ui/FrostedInput";
import { FrostedDropdown } from "@/components/ui/FrostedDropdown";
import { UTMAutocomplete } from "@/components/ui/UTMAutocomplete";

type AdvancedLinkModalProps = {
	onClose: () => void;
	onCreate: (link: TrackingLink) => void;
	productOptions: {
		value: string;
		label: string;
		route?: string | null;
		checkoutId?: string | null;
		category?: string | null;
	}[];
	canUseMetaPixel: boolean;
};

type WhopProductLite = {
	id: string;
	title: string;
	route?: string | null;
	checkoutId?: string | null;
	category?: string | null;
};

function buildProductDestinationUrl(
	route: string | null | undefined,
	checkoutId: string | null | undefined,
	destinationType: "checkout" | "store",
): string {
	const base = "https://whop.com";

	// Prefer using the Whop product/plan identifier (prod_...) for checkout
	// URLs so that we match Whop's own checkout links.
	const checkoutRaw =
		typeof checkoutId === "string" ? checkoutId.trim() : "";

	if (destinationType === "checkout" && checkoutRaw) {
		// If the identifier is already a full URL, use it directly.
		if (/^https?:\/\//i.test(checkoutRaw)) {
			return checkoutRaw;
		}

		const cleanId = checkoutRaw.replace(/^\/+/, "");

		// If it already includes the checkout prefix, avoid double-prefixing.
		if (cleanId.startsWith("checkout/")) {
			return `${base}/${cleanId}`;
		}

		return `${base}/checkout/${cleanId}`;
	}

	if (!route || typeof route !== "string") return "";

	const raw = route.trim();
	if (!raw) return "";

	const isFullUrl = /^https?:\/\//i.test(raw);

	if (destinationType === "store") {
		// Public product / store page for this route.
		if (isFullUrl) {
			try {
				const url = new URL(raw);
				url.pathname = url.pathname.replace(/^\/checkout\/?/, "/");
				return url.toString();
			} catch {
				return raw;
			}
		}

		const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
		return `${base}${normalizedPath}`;
	}

	// Attempt to send users directly to checkout for this product.
	// We derive a checkout URL from the product route so the toggle
	// actually results in a different destination.
	if (isFullUrl) {
		try {
			const url = new URL(raw);
			if (url.pathname.startsWith("/checkout")) {
				return url.toString();
			}
			const pathWithoutLeadingSlash = url.pathname.replace(/^\/+/, "");
			url.pathname = `/checkout/${pathWithoutLeadingSlash}`;
			return url.toString();
		} catch {
			// Fall through to path-based logic.
		}
	}

	const normalizedRoute = raw.startsWith("/") ? raw : `/${raw}`;
	const slug = normalizedRoute.replace(/^\/+/, "");
	if (slug.startsWith("checkout/")) {
		return `${base}/${slug}`;
	}
	return `${base}/checkout/${slug}`;
}

function buildAdvancedTrackingUrl(
	base: string,
	utmSource: string,
	utmMedium: string,
	utmCampaign: string,
	linkId?: string,
): string {
	const trimmed = base.trim();
	if (!trimmed) return "";

	const cleanSource = utmSource.trim();
	const cleanMedium = utmMedium.trim();
	const cleanCampaign = utmCampaign.trim();
	const cleanLinkId = (linkId ?? "").trim();

	try {
		const url = new URL(trimmed);
		if (cleanSource) url.searchParams.set("utm_source", cleanSource);
		if (cleanMedium) url.searchParams.set("utm_medium", cleanMedium);
		if (cleanCampaign) url.searchParams.set("utm_campaign", cleanCampaign);
		if (cleanLinkId) url.searchParams.set("wa_link_id", cleanLinkId);
		return url.toString();
	} catch {
		const [withoutHash, hash] = trimmed.split("#", 2);
		const hasQuery = withoutHash.includes("?");
		const parts: string[] = [];
		if (cleanSource)
			parts.push(`utm_source=${encodeURIComponent(cleanSource)}`);
		if (cleanMedium)
			parts.push(`utm_medium=${encodeURIComponent(cleanMedium)}`);
		if (cleanCampaign)
			parts.push(`utm_campaign=${encodeURIComponent(cleanCampaign)}`);
		if (cleanLinkId)
			parts.push(`wa_link_id=${encodeURIComponent(cleanLinkId)}`);

		if (!parts.length) return trimmed;

		const sep = hasQuery ? "&" : "?";
		const query = parts.join("&");
		const combined = `${withoutHash}${sep}${query}`;
		return hash ? `${combined}#${hash}` : combined;
	}
}

export default function AdvancedLinksPage() {
	const [advancedLinks, setAdvancedLinks] = useState<TrackingLink[]>([]);
	const [allProducts, setAllProducts] = useState<WhopProductLite[]>([]);
	const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isReloading, setIsReloading] = useState(false);
	const [viewArchived, setViewArchived] = useState<"active" | "archived">("active");
	const [pendingArchive, setPendingArchive] = useState<TrackingLink | null>(null);
	const [pendingDelete, setPendingDelete] = useState<TrackingLink | null>(null);
	const [archiveToast, setArchiveToast] = useState<{ id: string; name?: string } | null>(
		null,
	);

	const archiveTimeoutRef = useRef<number | null>(null);

	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const [linkTypeFilter, setLinkTypeFilter] = useState<"all" | "store" | "checkout">("all");
	const [productFilter, setProductFilter] = useState<string>("all");
	const [sortField, setSortField] = useState<"createdAt" | "clicks" | "conversionRate">(
		"createdAt",
	);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
	const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
	const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
	const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
	const [viewMode, setViewMode] = useState<"cards" | "table">(() => {
		// Initialize from localStorage if available
		if (typeof window !== "undefined") {
			try {
				const stored = window.localStorage.getItem("utm_advanced_links_view_mode");
				if (stored === "cards" || stored === "table") {
					return stored;
				}
			} catch { }
		}
		return "cards";
	});
	const [selectedLink, setSelectedLink] = useState<{ link: TrackingLink; metrics?: LinkMetrics } | null>(null);

	// Save view mode preference to localStorage when it changes
	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem("utm_advanced_links_view_mode", viewMode);
		} catch { }
	}, [viewMode]);

	const { planId, capabilities } = useCurrentPlan();
	const params = useParams() as { companyId?: string };
	const companyId = params.companyId ?? "workspace";
	const [hasMetaPixel, setHasMetaPixel] = useState(false);
	const [metaPixelLoaded, setMetaPixelLoaded] = useState(false);

	const loadFromLocalStorage = useCallback(() => {
		if (typeof window === "undefined") return;
		try {
			const raw = window.localStorage.getItem("utm_advanced_links");
			if (!raw) return;
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				setAdvancedLinks(parsed as TrackingLink[]);
			}
		} catch {
		}
	}, []);

	const loadAdvancedLinks = useCallback(async () => {
		try {
			const res = await fetch("/api/advanced-links");
			if (!res.ok) throw new Error("Failed to load advanced links");

			const data = (await res.json()) as { links?: TrackingLink[] };

			if (Array.isArray(data.links) && data.links.length > 0) {
				setAdvancedLinks(data.links);
			} else {
				loadFromLocalStorage();
			}
		} catch {
			loadFromLocalStorage();
		}
	}, [loadFromLocalStorage]);

	useEffect(() => {
		let cancelled = false;

		const run = async () => {
			if (cancelled) return;
			await loadAdvancedLinks();
		};

		void run();

		const intervalId = setInterval(() => {
			void run();
		}, 15000);

		return () => {
			cancelled = true;
			clearInterval(intervalId);
		};
	}, [loadAdvancedLinks]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		if (!advancedLinks.length) return;

		try {
			window.localStorage.setItem(
				"utm_advanced_links",
				JSON.stringify(advancedLinks),
			);
		} catch {
		}
	}, [advancedLinks]);

	useEffect(() => {
		let cancelled = false;

		async function loadProducts() {
			try {
				const res = await fetch("/api/whop-products");
				if (!res.ok) throw new Error("Failed to load Whop products");

				const data = (await res.json()) as { products?: WhopProductLite[] };
				if (cancelled) return;

				if (Array.isArray(data.products)) {
					setAllProducts(data.products);
				}
			} catch {
				if (cancelled) return;
				setAllProducts([]);
			}
		}

		void loadProducts();

		return () => {
			cancelled = true;
		};
	}, []);

	const productOptions = useMemo(
		() =>
			allProducts
				.filter((product) =>
					typeof product.title === "string" && product.title.trim().length > 0,
				)
				.map((product) => ({
					value: product.id,
					label: product.title,
					route: product.route ?? null,
					checkoutId: product.checkoutId ?? null,
					category: product.category ?? null,
				})),
		[allProducts],
	);

	useEffect(() => {
		let cancelled = false;

		async function loadMetaPixel() {
			try {
				const res = await fetch(
					`/api/meta-pixel?companyId=${encodeURIComponent(companyId)}`,
				);
				if (!res.ok) return;
				const data = (await res.json()) as { metaPixelId?: string | null };
				if (cancelled) return;
				setHasMetaPixel(Boolean(data.metaPixelId && data.metaPixelId.trim()));
			} finally {
				if (!cancelled) setMetaPixelLoaded(true);
			}
		}

		void loadMetaPixel();

		return () => {
			cancelled = true;
		};
	}, [companyId]);

	const canUseMetaPixelForAdvancedLinks =
		planId === "pro" && metaPixelLoaded && hasMetaPixel;

	const visibleAdvancedLinks = useMemo(
		() =>
			advancedLinks.filter((link) =>
				viewArchived === "archived" ? link.archived : !link.archived,
			),
		[advancedLinks, viewArchived],
	);
	const productFilterOptions = useMemo(() => {
		const names = new Set<string>();
		for (const link of visibleAdvancedLinks) {
			if (link.product && typeof link.product === "string") {
				names.add(link.product);
			}
		}
		return Array.from(names).sort((a, b) => a.localeCompare(b));
	}, [visibleAdvancedLinks]);

	const filteredAdvancedLinks = useMemo(() => {
		let list = visibleAdvancedLinks;

		// Search
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			list = list.filter((link) => {
				return (
					link.name.toLowerCase().includes(query) ||
					link.product.toLowerCase().includes(query) ||
					link.slug?.toLowerCase().includes(query) ||
					link.destination?.toLowerCase().includes(query) ||
					link.trackingUrl?.toLowerCase().includes(query) ||
					link.utmSource?.toLowerCase().includes(query) ||
					link.utmMedium?.toLowerCase().includes(query) ||
					link.utmCampaign?.toLowerCase().includes(query)
				);
			});
		}

		// Link type filter: store vs checkout, based on destination URL
		if (linkTypeFilter !== "all") {
			list = list.filter((link) => {
				const dest = (link.destination ?? "").toLowerCase();
				const isCheckout = dest.includes("/checkout");
				return linkTypeFilter === "checkout" ? isCheckout : !isCheckout;
			});
		}

		// Product filter
		if (productFilter !== "all") {
			list = list.filter((link) => link.product === productFilter);
		}

		// Sorting
		const sorted = [...list].sort((a, b) => {
			let aVal: number = 0;
			let bVal: number = 0;

			if (sortField === "createdAt") {
				aVal = new Date(a.createdAt).getTime();
				bVal = new Date(b.createdAt).getTime();
			} else if (sortField === "clicks") {
				aVal = a.clicks ?? 0;
				bVal = b.clicks ?? 0;
			} else if (sortField === "conversionRate") {
				aVal = a.conversionRate ?? 0;
				bVal = b.conversionRate ?? 0;
			}

			if (Number.isNaN(aVal)) aVal = 0;
			if (Number.isNaN(bVal)) bVal = 0;

			const direction = sortDirection === "asc" ? 1 : -1;
			if (aVal === bVal) return 0;
			return aVal > bVal ? direction : -direction;
		});

		return sorted;
	}, [
		visibleAdvancedLinks,
		searchQuery,
		linkTypeFilter,
		productFilter,
		sortField,
		sortDirection,
	]);

	const canUseFilters = planId !== "free";

	const activeLinksCount = useMemo(
		() => advancedLinks.filter((link) => !link.archived).length,
		[advancedLinks],
	);

	const atLinkLimit =
		capabilities.maxLinks !== null &&
		activeLinksCount >= capabilities.maxLinks;

	const sortFieldLabel = useMemo(() => {
		if (sortField === "clicks") return "Clicks";
		if (sortField === "conversionRate") return "Conversion rate";
		return "Date created";
	}, [sortField]);

	const handleReload = async () => {
		if (isReloading) return;
		setIsReloading(true);
		try {
			await loadAdvancedLinks();
		} finally {
			setIsReloading(false);
		}
	};

	const handleCreateAdvancedLink = (link: TrackingLink) => {
		const nonArchivedCount = advancedLinks.filter((item) => !item.archived).length;
		if (
			capabilities.maxLinks !== null &&
			nonArchivedCount >= capabilities.maxLinks
		) {
			setIsUpgradeModalOpen(true);
			return;
		}

		setAdvancedLinks((prev) => [...prev, link]);

		void (async () => {
			try {
				await fetch("/api/advanced-links", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(link),
				});
			} catch {
				// Best-effort persistence; UI state is already updated.
			}
		})();

		setIsAdvancedModalOpen(false);
	};

	const handleArchiveAdvancedLink = (id: string) => {
		const linkToArchive = advancedLinks.find((link) => link.id === id);

		setAdvancedLinks((prev) =>
			prev.map((link) =>
				link.id === id
					? {
						...link,
						archived: true,
					}
					: link,
			),
		);

		setArchiveToast({ id, name: linkToArchive?.name });

		if (archiveTimeoutRef.current != null) {
			window.clearTimeout(archiveTimeoutRef.current);
		}
		archiveTimeoutRef.current = window.setTimeout(() => {
			setArchiveToast(null);
			archiveTimeoutRef.current = null;
		}, 4000);

		void (async () => {
			try {
				await fetch("/api/advanced-links", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id, archived: true }),
				});
			} catch {
				// Best-effort persistence; ignore errors for now.
			}
		})();
	};

	const handleRestoreAdvancedLink = (id: string) => {
		setAdvancedLinks((prev) =>
			prev.map((link) =>
				link.id === id
					? {
						...link,
						archived: false,
					}
					: link,
			),
		);

		void (async () => {
			try {
				await fetch("/api/advanced-links", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id, archived: false }),
				});
			} catch {
				// Best-effort persistence; UI already updated.
			}
		})();
	};

	const openDeleteConfirm = (id: string) => {
		const link = advancedLinks.find((link) => link.id === id);
		if (!link) return;
		setPendingDelete(link);
	};

	const handleCancelDelete = () => {
		setPendingDelete(null);
	};

	const handleConfirmDelete = () => {
		if (!pendingDelete) return;

		const id = pendingDelete.id;

		setAdvancedLinks((prev) => prev.filter((link) => link.id !== id));
		setPendingDelete(null);

		void (async () => {
			try {
				await fetch("/api/advanced-links", {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id }),
				});
			} catch {
				// Best-effort persistence; ignore errors for now.
			}
		})();
	};

	const openArchiveConfirm = (id: string) => {
		const link = advancedLinks.find((link) => link.id === id);
		if (!link) return;
		setPendingArchive(link);
	};

	const handleCancelArchive = () => {
		setPendingArchive(null);
	};

	const handleConfirmArchive = () => {
		if (!pendingArchive) return;
		handleArchiveAdvancedLink(pendingArchive.id);
		setPendingArchive(null);
	};

	const handleUndoArchive = () => {
		if (!archiveToast) return;
		const { id } = archiveToast;

		setAdvancedLinks((prev) =>
			prev.map((link) =>
				link.id === id
					? {
						...link,
						archived: false,
					}
					: link,
			),
		);

		setArchiveToast(null);
		if (archiveTimeoutRef.current != null) {
			window.clearTimeout(archiveTimeoutRef.current);
			archiveTimeoutRef.current = null;
		}

		void (async () => {
			try {
				await fetch("/api/advanced-links", {
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ id, archived: false }),
				});
			} catch {
				// Best-effort persistence; ignore errors for now.
			}
		})();
	};

	return (
		<div className="min-h-screen bg-background p-4 md:p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				<div className="rounded-lg bg-white dark:bg-[#121212] border border-transparent dark:border-[#292929] overflow-hidden shadow-md">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-5 bg-white dark:bg-[#121212]">
						<div>
							<h1 className="text-[24px] font-semibold text-black dark:text-white mb-1">
								Advanced tracking links
							</h1>
							<p className="text-sm text-muted-foreground">
								Track clicks, conversions, and revenue from your marketing campaigns
							</p>
						</div>
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={handleReload}
								disabled={isReloading}
								className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<span className="text-base leading-none">{isReloading ? '⟳' : '↻'}</span>
								<span>Refresh</span>
							</button>
							<button
								type="button"
								onClick={() => {
									if (atLinkLimit) {
										setIsUpgradeModalOpen(true);
										return;
									}
									setIsAdvancedModalOpen(true);
								}}
								className="flex items-center gap-2 px-4 py-2 bg-[#050B1E] text-white dark:bg-white dark:text-black border border-border rounded-lg transition-colors font-medium text-sm hover:shadow-md hover:-translate-y-0.5 transform"
							>
								<span className="text-base leading-none">+</span>
								<span>New Link</span>
							</button>
						</div>
					</div>

					<div className="px-6 py-3 bg-white dark:bg-[#121212]">
						<LinksToolbar
							searchValue={searchQuery}
							onSearchChange={setSearchQuery}
							showFilterButton={canUseFilters}
							onFilterClick={canUseFilters ? () => setIsFiltersOpen((open) => !open) : undefined}
							// Only show the dark active pill style while the filters panel is
							// actually open; when closed, keep the button white with a dark icon.
							isFilterActive={canUseFilters ? isFiltersOpen : false}
							rightSlot={
								<div className="flex items-center gap-2">
									<div className="inline-flex h-10 items-center rounded-lg border border-transparent dark:border-border bg-gray-100 dark:bg-[#111111] shadow-sm p-0.5 text-[11px]">
										<button
											type="button"
											className={`h-full px-3 rounded-md transition-colors ${viewMode === "cards"
												? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
												: "bg-white text-black dark:bg-[#181818] dark:text-white"
												}`}
											onClick={() => setViewMode("cards")}
											title="Card view"
										>
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<rect x="3" y="3" width="7" height="7" rx="1" />
												<rect x="14" y="3" width="7" height="7" rx="1" />
												<rect x="3" y="14" width="7" height="7" rx="1" />
												<rect x="14" y="14" width="7" height="7" rx="1" />
											</svg>
										</button>
										<button
											type="button"
											className={`h-full px-3 rounded-md transition-colors ${viewMode === "table"
												? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
												: "bg-white text-black dark:bg-[#181818] dark:text-white"
												}`}
											onClick={() => setViewMode("table")}
											title="Table view"
										>
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
											</svg>
										</button>
									</div>
									<div className="inline-flex h-10 items-center rounded-lg border border-transparent dark:border-border bg-gray-100 dark:bg-[#111111] shadow-sm p-0.5 text-[11px]">
										<button
											type="button"
											className={`h-full px-3 rounded-md transition-colors ${viewArchived === "active"
												? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
												: "bg-white text-black dark:bg-[#181818] dark:text-white"
												}`}
											onClick={() => setViewArchived("active")}
										>
											Active
										</button>
										<button
											type="button"
											className={`h-full px-3 rounded-md transition-colors ${viewArchived === "archived"
												? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
												: "bg-white text-black dark:bg-[#181818] dark:text-white"
												}`}
											onClick={() => setViewArchived("archived")}
										>
											Archived
										</button>
									</div>
								</div>
							}
						/>
						{isFiltersOpen && (
							<div className="mt-3 rounded-xl border border-transparent dark:border-border bg-gray-50 dark:bg-[#111111] shadow-sm px-4 py-3 text-xs text-foreground flex flex-col gap-3">
								<div className="flex flex-wrap gap-3">
									<div className="flex items-center justify-between gap-3 min-w-[220px]">
										<span className="text-[11px] uppercase tracking-wide text-black dark:text-white">
											Link type
										</span>
										<div className="inline-flex rounded-full bg-gray-200 dark:bg-[#181818] p-0.5 text-[11px]">
											<button
												type="button"
												className={`px-3 py-1 rounded-full transition-colors ${linkTypeFilter === "all"
													? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
													: "text-black dark:text-white"
													}`}
												onClick={() => setLinkTypeFilter("all")}
											>
												All
											</button>
											<button
												type="button"
												className={`px-3 py-1 rounded-full transition-colors ${linkTypeFilter === "store"
													? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
													: "text-black dark:text-white"
													}`}
												onClick={() => setLinkTypeFilter("store")}
											>
												Store pages
											</button>
											<button
												type="button"
												className={`px-3 py-1 rounded-full transition-colors ${linkTypeFilter === "checkout"
													? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
													: "text-black dark:text-white"
													}`}
												onClick={() => setLinkTypeFilter("checkout")}
											>
												Checkout links
											</button>
										</div>
									</div>

									<div className="flex items-center justify-between gap-3 min-w-[220px]">
										<span className="text-[11px] uppercase tracking-wide text-black dark:text-white">
											Product
										</span>
										<div className="relative inline-flex w-full max-w-[220px] justify-end">
											<button
												type="button"
												onClick={() => setIsProductMenuOpen((open) => !open)}
												className={`h-7 w-full inline-flex items-center justify-between rounded-full border border-transparent dark:border-border px-2 text-[11px] transition-colors ${productFilter !== "all" || isProductMenuOpen
													? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm hover:bg-[#050B1E] dark:hover:bg-white/90"
													: "bg-white dark:bg-[#181818] text-black dark:text-white border border-black dark:border-white shadow-none hover:bg-gray-100 dark:hover:bg-[#202020]"
													}`}
											>
												<span className="truncate">
													{productFilter === "all" ? "All products" : productFilter}
												</span>
												<span className="ml-1 text-[9px] text-black dark:text-white">▾</span>
											</button>
											{isProductMenuOpen && (
												<div className="absolute left-0 top-full z-40 mt-0.5 w-full rounded-lg border border-gray-300 dark:border-border bg-white dark:bg-[#181818] py-1 text-[11px] shadow-lg">
													{["all", ...productFilterOptions].map((name) => {
														const label = name === "all" ? "All products" : name;
														return (
															<button
																key={name}
																type="button"
																onClick={() => {
																	setProductFilter(name);
																	setIsProductMenuOpen(false);
																}}
																className={`flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-[#222222] ${productFilter === name
																	? "text-foreground"
																	: "text-black dark:text-white"
																	}`}
															>
																<span className="inline-flex w-2 justify-center text-[12px] font-semibold leading-none">
																	{productFilter === name ? "•" : ""}
																</span>
																<span className="truncate">{label}</span>
															</button>
														);
													})}
												</div>
											)}
										</div>
									</div>

									<div className="flex items-center justify-between gap-3 min-w-[260px]">
										<span className="text-[11px] uppercase tracking-wide text-black dark:text-white">
											Sort by
										</span>
										<div className="flex gap-2 justify-end flex-1">
											<div className="relative flex-1 max-w-[200px]">
												<button
													type="button"
													onClick={() => setIsSortMenuOpen((open) => !open)}
													className={`h-7 w-full inline-flex items-center justify-between rounded-md border border-transparent dark:border-border px-2 text-[11px] transition-colors ${sortField !== "createdAt" || isSortMenuOpen
														? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm hover:bg-[#050B1E] dark:hover:bg-white/90"
														: "bg-white dark:bg-[#181818] text-foreground hover:bg-gray-50 dark:hover:bg-[#202020]"
														}`}
												>
													<span className="truncate">{sortFieldLabel}</span>
													<span className="ml-1 text-[9px] text-black dark:text-white">▾</span>
												</button>
												{isSortMenuOpen && (
													<div className="absolute left-0 top-full z-40 mt-0.5 w-full rounded-lg border border-gray-300 dark:border-border bg-white dark:bg-[#181818] py-1 text-[11px] shadow-lg">
														{[
															{ value: "createdAt", label: "Date created" },
															{ value: "clicks", label: "Clicks" },
															{ value: "conversionRate", label: "Conversion rate" },
														].map((opt) => (
															<button
																key={opt.value}
																type="button"
																onClick={() => {
																	setSortField(
																		opt.value as "createdAt" | "clicks" | "conversionRate",
																	);
																	setIsSortMenuOpen(false);
																}}
																className={`flex w-full items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-[#222222] ${sortField === opt.value
																	? "text-foreground"
																	: "text-muted-foreground"
																	}`}
															>
																<span className="inline-flex w-4 justify-center text-[12px] font-semibold leading-none">
																	{sortField === opt.value ? "•" : ""}
																</span>
																<span className="truncate">{opt.label}</span>
															</button>
														))}
													</div>
												)}
											</div>
											<button
												type="button"
												onClick={() =>
													setSortDirection((dir) => (dir === "desc" ? "asc" : "desc"))
												}
												className="h-8 w-16 rounded-lg border border-transparent dark:border-border bg-[#050B1E] dark:bg-white text-[11px] text-white dark:text-black shadow-sm hover:bg-[#050B1E] dark:hover:bg-white/90"
											>
												{sortDirection === "desc" ? "↓" : "↑"}
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{filteredAdvancedLinks.length === 0 ? (
						<div className="text-center py-16 px-6 bg-white dark:bg-[#121212] rounded-lg">
							<div className="text-5xl mb-4">🔗</div>
							<h3 className="text-xl font-semibold mb-2 text-foreground">
								{visibleAdvancedLinks.length === 0
									? viewArchived === "archived"
										? "No archived links yet"
										: "Create your first advanced tracking link to monitor campaign performance"
									: "Try adjusting your search to find what you're looking for"}
							</h3>
							<p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
								{visibleAdvancedLinks.length === 0
									? viewArchived === "archived"
										? "You haven't archived any advanced links yet. Switch back to Active to manage live campaigns."
										: "Create your first advanced tracking link to monitor campaign performance"
									: "Try adjusting your search to find what you're looking for"}
							</p>
							{visibleAdvancedLinks.length === 0 && viewArchived === "active" && (
								<button
									type="button"
									onClick={() => {
										if (atLinkLimit) {
											setIsUpgradeModalOpen(true);
											return;
										}
										setIsAdvancedModalOpen(true);
									}}
									className="inline-flex items-center gap-2 rounded-lg bg-white text-black hover:bg-gray-100 border border-border px-4 py-2 text-sm font-medium transition-colors"
								>
									<span className="text-base leading-none">+</span>
									<span>Add Link</span>
								</button>
							)}
						</div>
					) : viewMode === "cards" ? (
						<StyledLinksTable
							mode="advanced"
							linksOverride={filteredAdvancedLinks}
							metricsOverride={[]}
							onArchiveLink={openArchiveConfirm}
							onRestoreLink={handleRestoreAdvancedLink}
							onDeleteLink={openDeleteConfirm}
							isArchivedView={viewArchived === "archived"}
							onLinkClick={(link, metrics) => setSelectedLink({ link, metrics })}
						/>
					) : (
						<LinksTable
							mode="advanced"
							linksOverride={filteredAdvancedLinks}
							metricsOverride={[]}
							onArchiveLink={openArchiveConfirm}
							onRestoreLink={handleRestoreAdvancedLink}
							onDeleteLink={openDeleteConfirm}
							isArchivedView={viewArchived === "archived"}
							onLinkClick={(link, metrics) => setSelectedLink({ link, metrics })}
						/>
					)}
				</div>

				{isAdvancedModalOpen && (
					<AdvancedLinkModal
						onClose={() => setIsAdvancedModalOpen(false)}
						onCreate={handleCreateAdvancedLink}
						productOptions={productOptions}
						canUseMetaPixel={canUseMetaPixelForAdvancedLinks}
					/>
				)}

				{selectedLink && (
					<LinkDetailsModal
						link={selectedLink.link}
						metrics={selectedLink.metrics}
						onClose={() => setSelectedLink(null)}
						mode="advanced"
					/>
				)}
			</div>
			{pendingArchive && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
					<div className="mx-4 w-full max-w-md rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl">
						<div className="px-6 pt-5 pb-4">
							<h2 className="text-lg font-semibold text-foreground mb-2">
								Archive link
							</h2>
							<p className="text-sm text-muted-foreground">
								Are you sure you want to archive "{pendingArchive.name}"? The link will be
								hidden from this list, but all data will be preserved.
							</p>
						</div>
						<div className="flex justify-end gap-2 px-6 pb-5">
							<button
								type="button"
								onClick={handleCancelArchive}
								className="inline-flex items-center justify-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/70 transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirmArchive}
								className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors"
							>
								Archive
							</button>
						</div>
					</div>
				</div>
			)}

			{pendingDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
					<div className="mx-4 w-full max-w-md rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl">
						<div className="px-6 pt-5 pb-4">
							<h2 className="text-lg font-semibold text-foreground mb-2">
								Delete link
							</h2>
							<p className="text-sm text-muted-foreground mb-3">
								Are you sure you want to permanently delete "{pendingDelete.name}"?
							</p>
							<p className="text-xs text-red-400">
								This action is not undoable. All data for this advanced link will be removed.
							</p>
						</div>
						<div className="flex justify-end gap-2 px-6 pb-5">
							<button
								type="button"
								onClick={handleCancelDelete}
								className="inline-flex items-center justify-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/70 transition-colors"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleConfirmDelete}
								className="inline-flex items-center justify-center rounded-full bg-red-500 text-white px-4 py-1.5 text-sm font-medium hover:bg-red-600 transition-colors"
							>
								Delete permanently
							</button>
						</div>
					</div>
				</div>
			)}

			{archiveToast && (
				<div className="pointer-events-none fixed bottom-4 right-4 z-50 flex justify-end">
					<div className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-card/95 border border-border px-4 py-2 text-sm shadow-lg">
						<span className="text-sm text-foreground">
							Link archived
						</span>
						<button
							type="button"
							onClick={handleUndoArchive}
							className="text-sm font-medium text-primary hover:underline"
						>
							Undo
						</button>
					</div>
				</div>
			)}

			{isUpgradeModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
					<div className="mx-4 w-full max-w-md rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl p-5">
						<h2 className="text-base font-semibold text-foreground mb-2">
							Upgrade to add more links
						</h2>
						<p className="text-sm text-muted-foreground mb-3">
							You're on the {capabilities.label} plan which allows up to {formatLimit(capabilities.maxLinks)} advanced links.
						</p>
						<p className="text-xs text-muted-foreground mb-4">
							Upgrade your plan to create additional advanced tracking links with full UTM controls.
						</p>
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setIsUpgradeModalOpen(false)}
								className="inline-flex items-center justify-center rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/70 transition-colors"
							>
								Close
							</button>
							<button
								type="button"
								className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
							>
								View plans
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function AdvancedLinkModal({
	onClose,
	onCreate,
	productOptions,
	canUseMetaPixel,
}: AdvancedLinkModalProps) {
	const { capabilities, planId } = useCurrentPlan();
	const canUseUtmFields = capabilities.canUseAdvancedUtmSegments;
	const [name, setName] = useState("");
	const [selectedProductId, setSelectedProductId] = useState("");
	const [destinationType, setDestinationType] = useState<"checkout" | "store">(
		"checkout",
	);
	const [utmSource, setUtmSource] = useState("");
	const [utmMedium, setUtmMedium] = useState("");
	const [utmCampaign, setUtmCampaign] = useState("");
	const [metaPixelEnabled, setMetaPixelEnabled] = useState(true);
	const [useCustomDestination, setUseCustomDestination] = useState(false);
	const [customDestination, setCustomDestination] = useState("");

	const selectedProduct = useMemo(
		() => productOptions.find((option) => option.value === selectedProductId),
		[productOptions, selectedProductId],
	);

	const canStore = !!selectedProduct?.route;
	const canCheckout = !!selectedProduct?.checkoutId;

	const productDropdownOptions = useMemo(
		() =>
			productOptions.map((option) => ({
				value: option.value,
				label: option.label,
				group: option.category ?? undefined,
			})),
		[productOptions],
	);

	const destinationOptions = useMemo(
		() => [
			{
				value: "checkout",
				label: "Checkout page",
				disabled: !canCheckout,
			},
			{
				value: "store",
				label: "Store page",
				disabled: !canStore,
			},
		],
		[canCheckout, canStore],
	);

	useEffect(() => {
		// If the user has chosen a destination that the selected product doesn't
		// support, gently nudge them to the only valid option instead of letting
		// them create a broken link.
		if (destinationType === "checkout" && !canCheckout && canStore) {
			setDestinationType("store");
		} else if (destinationType === "store" && !canStore && canCheckout) {
			setDestinationType("checkout");
		}
	}, [destinationType, canCheckout, canStore]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const selectedProduct = productOptions.find(
			(option) => option.value === selectedProductId,
		);

		const linkId = `adv_${Date.now()}`;

		let dest = "";
		if (useCustomDestination && customDestination.trim()) {
			let base = customDestination.trim();
			// If the user omits the scheme (e.g. "example.com"), default to https://
			// so redirects go to the correct external domain instead of a relative path.
			if (!/^https?:\/\//i.test(base)) {
				base = `https://${base}`;
			}
			dest = base;
		} else {
			dest = buildProductDestinationUrl(
				selectedProduct?.route ?? null,
				selectedProduct?.checkoutId ?? null,
				destinationType,
			);
		}
		const cleanName = name.trim();
		const cleanUtmSource = utmSource.trim();
		const cleanUtmMedium = utmMedium.trim();
		const cleanUtmCampaign = utmCampaign.trim();

		const productName = (selectedProduct?.label ?? "Advanced link").trim();
		const baseName = cleanName || productName || "Advanced link";

		let slug = baseName
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");

		if (!slug && dest) {
			try {
				const url = new URL(dest);
				slug =
					url.pathname
						.replace(/^\/+/, "")
						.toLowerCase()
						.replace(/\s+/g, "-")
						.replace(/[^a-z0-9-]/g, "") || `advanced-${Date.now()}`;
			} catch {
				slug = `advanced-${Date.now()}`;
			}
		}

		if (!slug) {
			slug = `advanced-${Date.now()}`;
		}

		// Get session token from cookie
		const getSessionToken = () => {
			if (typeof document === "undefined") return null;
			const match = document.cookie.match(/utm_session=([^;]+)/);
			return match ? match[1] : null;
		};

		const sessionToken = getSessionToken();

		// ALWAYS call checkout API for checkout links to ensure UTM tracking
		if (
			!useCustomDestination &&
			destinationType === "checkout" &&
			selectedProduct?.checkoutId
		) {
			try {
				const res = await fetch("/api/create-whop-checkout", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						planId: selectedProduct.checkoutId,
						waLinkId: linkId,
						metadata: {
							utm_source: cleanUtmSource || undefined,
							utm_medium: cleanUtmMedium || undefined,
							utm_campaign: cleanUtmCampaign || undefined,
							session_token: sessionToken || undefined,
						},
					}),
				});

				if (res.ok) {
					const data = (await res.json()) as { purchaseUrl?: string };
					if (typeof data.purchaseUrl === "string" && data.purchaseUrl.trim()) {
						dest = data.purchaseUrl.trim();
						console.log("[AdvancedLinkModal] Checkout URL created with UTM metadata:", {
							linkId,
							utm_source: cleanUtmSource,
							utm_medium: cleanUtmMedium,
							utm_campaign: cleanUtmCampaign,
							session_token: sessionToken,
						});
					}
				} else {
					console.error("[AdvancedLinkModal] Failed to create checkout session:", await res.text());
				}
			} catch (error) {
				console.error("[AdvancedLinkModal] Error creating checkout session:", error);
				// If session creation fails, fall back to the static checkout URL.
			}
		}

		const trackingUrl = dest
			? buildAdvancedTrackingUrl(
				dest,
				cleanUtmSource,
				cleanUtmMedium,
				cleanUtmCampaign,
				linkId,
			)
			: "";

		const newLink: TrackingLink = {
			id: linkId,
			name: baseName,
			slug,
			product: productName,
			productPrice: undefined,
			trackingUrl: trackingUrl || undefined,
			archived: false,
			destination: dest,
			utmSource: cleanUtmSource || undefined,
			utmMedium: cleanUtmMedium || undefined,
			utmCampaign: cleanUtmCampaign || undefined,
			metaPixelEnabled:
				canUseMetaPixel && destinationType === "checkout" ? metaPixelEnabled : false,
			createdAt: new Date().toISOString(),
		};

		onCreate(newLink);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
			<div className="w-full max-w-lg rounded-2xl bg-white/95 dark:bg-black/10 backdrop-blur-2xl border border-gray-300 dark:border-white/10 shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-sm font-semibold text-gray-900 dark:text-white">New advanced tracking link</h2>
					<button
						type="button"
						onClick={onClose}
						className="h-6 w-6 rounded-full text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-3 text-xs">
					<div className="grid grid-cols-1 gap-3">
						<FrostedInput
							label="Link name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Retargeting LP - TikTok ads"
							className="h-9 text-[11px]"
						/>

						{!useCustomDestination && productOptions.length > 0 && (
							<FrostedDropdown
								label="Product / plan label"
								value={selectedProductId}
								onChange={(next) => setSelectedProductId(next)}
								placeholder="Select product (optional)"
								options={productDropdownOptions}
								className="text-[11px]"
							/>
						)}

						{planId === "pro" && (
							<label className="mt-1 inline-flex items-center gap-2 rounded-md bg-gray-100 dark:bg-white/10 px-2 py-1">
								<input
									type="checkbox"
									checked={useCustomDestination}
									onChange={(event) =>
										setUseCustomDestination(event.target.checked)
									}
									className="h-3 w-3 rounded border-gray-300 dark:border-white/20 text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
								/>
								<span className="text-[11px] text-gray-700 dark:text-gray-300">
									Override destination with a custom URL (Pro only)
								</span>
							</label>
						)}

						{!useCustomDestination && (
							<FrostedDropdown
								label="Destination page"
								value={destinationType}
								onChange={(next) =>
									setDestinationType(next === "store" ? "store" : "checkout")
								}
								options={destinationOptions}
								className="text-[11px]"
							/>
						)}

						{planId === "pro" && useCustomDestination && (
							<label className="mt-1 flex flex-col gap-1">
								<FrostedInput
									label="Custom destination URL"
									type="text"
									value={customDestination}
									onChange={(e) => setCustomDestination(e.target.value)}
									placeholder="https://your-landing-page.com"
									className="h-9 text-[11px]"
								/>
							</label>
						)}

						{canUseMetaPixel && destinationType === "checkout" && (
							<label className="mt-1 inline-flex items-center gap-2 rounded-md bg-gray-100 dark:bg-white/10 px-2 py-1">
								<input
									type="checkbox"
									checked={metaPixelEnabled}
									onChange={(event) => setMetaPixelEnabled(event.target.checked)}
									className="h-3 w-3 rounded border-gray-300 dark:border-white/20 text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
								/>
								<span className="text-[11px] text-gray-700 dark:text-gray-300">
									Fire Meta Pixel for this checkout link
								</span>
							</label>
						)}

						{canUseUtmFields ? (
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								<UTMAutocomplete
									label="UTM source"
									value={utmSource}
									onChange={setUtmSource}
									placeholder="tiktok"
									field="source"
									className="h-9 text-[11px]"
								/>

								<UTMAutocomplete
									label="UTM medium"
									value={utmMedium}
									onChange={setUtmMedium}
									placeholder="cpc"
									field="medium"
									className="h-9 text-[11px]"
								/>

								<UTMAutocomplete
									label="UTM campaign"
									value={utmCampaign}
									onChange={setUtmCampaign}
									placeholder="summer_sale"
									field="campaign"
									className="h-9 text-[11px]"
								/>
							</div>
						) : (
							<div className="mt-1 rounded-md border border-dashed border-border/70 bg-muted/50 px-3 py-2 flex items-center justify-between gap-3">
								<div className="text-[11px] text-muted-foreground">
									<span className="font-medium">Advanced UTM controls</span>
									<span className="mx-1">·</span>
									<span>Available on Growth and Pro plans.</span>
								</div>
								<span className="inline-flex items-center rounded-full bg-black text-white dark:bg-white dark:text-black px-2.5 py-0.5 text-[10px] font-medium">
									Upgrade to unlock
								</span>
							</div>
						)}
					</div>

					<div className="mt-4 flex items-center justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="h-8 rounded-md px-3 text-[11px] text-muted-foreground hover:bg-accent transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="h-8 rounded-md px-3 text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
						>
							Save advanced link
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
