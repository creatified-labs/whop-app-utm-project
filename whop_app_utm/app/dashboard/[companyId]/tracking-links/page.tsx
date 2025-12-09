"use client";

import React, { useState, useMemo, useEffect } from "react";
import { LinksToolbar } from "@/components/links/LinksToolbar";
import { LinksTable } from "@/components/links/LinksTable";
import type { TrackingLink } from "@/lib/utm/types";
import { useUtmData } from "@/lib/utm/hooks";

type ViewType = "Whops Tracking Links" | "Advance Tracking Links";

type AdvancedLinkModalProps = {
  onClose: () => void;
  onCreate: (link: TrackingLink) => void;
  whopLinks: TrackingLink[];
  productOptions: { value: string; label: string }[];
};

type WhopProductLite = {
  id: string;
  title: string;
};

type TrackingLinksPageProps = {
  initialView?: ViewType;
};

function buildAdvancedTrackingUrl(
  base: string,
  utmSource: string,
  utmMedium: string,
  utmCampaign: string,
): string {
  const trimmed = base.trim();
  if (!trimmed) return "";

  const cleanSource = utmSource.trim();
  const cleanMedium = utmMedium.trim();
  const cleanCampaign = utmCampaign.trim();

  try {
    const url = new URL(trimmed);
    if (cleanSource) url.searchParams.set("utm_source", cleanSource);
    if (cleanMedium) url.searchParams.set("utm_medium", cleanMedium);
    if (cleanCampaign) url.searchParams.set("utm_campaign", cleanCampaign);
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

    if (!parts.length) return trimmed;

    const sep = hasQuery ? "&" : "?";
    const query = parts.join("&");
    const combined = `${withoutHash}${sep}${query}`;
    return hash ? `${combined}#${hash}` : combined;
  }
}

export default function TrackingLinksPage({ initialView }: TrackingLinksPageProps) {
  const [activeView, setActiveView] = useState<ViewType>(
    initialView ?? "Whops Tracking Links",
  );
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [advancedLinks, setAdvancedLinks] = useState<TrackingLink[]>([]);
  const [allProducts, setAllProducts] = useState<WhopProductLite[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [productFilter, setProductFilter] = useState<string>("all");
  const { links: whopLinksRaw } = useUtmData();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialView) return;

    try {
      const storedView = window.localStorage.getItem("utm_active_view");
      if (storedView === "Whops Tracking Links" || storedView === "Advance Tracking Links") {
        setActiveView(storedView as ViewType);
      }
    } catch {
    }
  }, [initialView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initialView) return;

    try {
      window.localStorage.setItem("utm_active_view", activeView);
    } catch {
    }
  }, [activeView, initialView]);

  useEffect(() => {
    let cancelled = false;

    const loadFromLocalStorage = () => {
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
    };

    async function loadAdvancedLinks() {
      try {
        const res = await fetch("/api/advanced-links");
        if (!res.ok) throw new Error("Failed to load advanced links");

        const data = (await res.json()) as { links?: TrackingLink[] };
        if (cancelled) return;

        if (Array.isArray(data.links) && data.links.length > 0) {
          setAdvancedLinks(data.links);
        } else {
          loadFromLocalStorage();
        }
      } catch {
        if (cancelled) return;
        loadFromLocalStorage();
      }
    }

    void loadAdvancedLinks();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const whopLinks = useMemo(
    () => whopLinksRaw.filter((link) => !!link.whopLinkId),
    [whopLinksRaw],
  );

  const filteredWhopLinks = useMemo(() => {
    let result = whopLinks;

    if (productFilter !== "all") {
      const target = productFilter.toLowerCase();
      result = result.filter((link) => link.product?.toLowerCase() === target);
    }

    if (!searchQuery.trim()) return result;

    const query = searchQuery.toLowerCase();
    return result.filter((link) => {
      return (
        link.name.toLowerCase().includes(query) ||
        link.product.toLowerCase().includes(query) ||
        link.slug?.toLowerCase().includes(query) ||
        link.destination?.toLowerCase().includes(query) ||
        link.trackingUrl?.toLowerCase().includes(query)
      );
    });
  }, [whopLinks, searchQuery, productFilter]);

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
      Array.from(
        new Set(
          [
            ...whopLinks
              .map((link) => link.product)
              .filter(
                (value): value is string =>
                  typeof value === "string" && value.trim().length > 0,
              ),
            ...allProducts
              .map((product) => product.title)
              .filter(
                (value): value is string =>
                  typeof value === "string" && value.trim().length > 0,
              ),
          ],
        ),
      ).map((title) => {
        const pricedLink = whopLinks.find(
          (link) => link.product === title && !!link.productPrice,
        );
        const price = pricedLink?.productPrice;
        return {
          value: title,
          label: price ? `${title} – ${price}` : title,
        };
      }),
    [whopLinks, allProducts],
  );

  const visibleAdvancedLinks = useMemo(
    () => advancedLinks.filter((link) => !link.archived),
    [advancedLinks],
  );

  const showAdvanced = activeView === "Advance Tracking Links";

  const handleCreateAdvancedLink = (link: TrackingLink) => {
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
    setActiveView("Advance Tracking Links");
  };

  const handleArchiveAdvancedLink = (id: string) => {
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-lg bg-white dark:bg-[#121212] border border-transparent dark:border-[#292929] overflow-hidden shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-5 bg-white dark:bg-[#121212]">
            <div>
              <h1 className="text-[24px] font-semibold text-black dark:text-white mb-1">
                Tracking links
              </h1>
              <p className="text-sm text-muted-foreground">
                View and manage your Whop tracking links
              </p>
            </div>
            <div className="flex items-center gap-3" />
          </div>

          <div className="px-6 py-3 bg-white dark:bg-[#121212]">
            <LinksToolbar 
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              onFilterClick={() => setIsFiltersOpen((open) => !open)}
              // Only show dark active state while the filters panel is open
              isFilterActive={isFiltersOpen}
            />

            {isFiltersOpen && (
              <div className="mt-3 rounded-xl border border-transparent dark:border-border bg-gray-50 dark:bg-[#111111] shadow-sm px-4 py-3 text-xs text-foreground flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 min-w-[220px]">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Product
                  </span>
                  <div className="relative inline-flex w-full max-w-[220px] justify-end">
                    <select
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="h-7 w-full rounded-md border border-input bg-white dark:bg-[#181818] px-2 text-[11px] text-foreground hover:bg-gray-50 dark:hover:bg-[#202020] focus:outline-none"
                    >
                      <option value="all">All products</option>
                      {productOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <LinksTable 
            mode="whop"
            linksOverride={filteredWhopLinks}
          />
        </div>

        {isAdvancedModalOpen && (
          <AdvancedLinkModal
            onClose={() => setIsAdvancedModalOpen(false)}
            onCreate={handleCreateAdvancedLink}
            whopLinks={whopLinks}
            productOptions={productOptions}
          />
        )}
      </div>
    </div>
  );
}

function AdvancedLinkModal({
  onClose,
  onCreate,
  whopLinks,
  productOptions,
}: AdvancedLinkModalProps) {
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [product, setProduct] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [selectedWhopLinkId, setSelectedWhopLinkId] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const dest = destination.trim();
    const cleanName = name.trim();
    const cleanProduct = product.trim();
    const cleanUtmSource = utmSource.trim();
    const cleanUtmMedium = utmMedium.trim();
    const cleanUtmCampaign = utmCampaign.trim();

    const baseName = cleanName || dest || "Advanced link";
    const productName = cleanProduct || "Advanced link";

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

    const trackingUrl = dest
      ? buildAdvancedTrackingUrl(dest, cleanUtmSource, cleanUtmMedium, cleanUtmCampaign)
      : "";

    const newLink: TrackingLink = {
      id: `adv_${Date.now()}`,
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
      createdAt: new Date().toISOString(),
    };

    onCreate(newLink);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-xl bg-background text-foreground border border-border shadow-[var(--glass-shadow)] p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            New advanced tracking link
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 rounded-full text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Link name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Retargeting LP - TikTok ads"
                className="h-9 rounded-md border border-input bg-background px-3 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Destination URL
              </span>
              {whopLinks.length > 0 && (
                <select
                  value={selectedWhopLinkId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedWhopLinkId(id);
                    const selected = whopLinks.find((link) => link.id === id);
                    if (selected) {
                      const urlToUse = selected.trackingUrl || selected.destination;
                      setDestination(urlToUse);
                      if (!name) {
                        setName(selected.name);
                      }
                      if (!product) {
                        setProduct(selected.product);
                      }
                    }
                  }}
                  className="mb-1 h-9 rounded-md border border-input bg-background px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  <option value="">Select Whop tracking link (optional)</option>
                  {whopLinks.map((link) => (
                    <option key={link.id} value={link.id}>
                      {link.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setSelectedWhopLinkId("");
                }}
                placeholder="https://your-landing-page.com"
                className="h-9 rounded-md border border-input bg-background px-3 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Product / plan label
              </span>
              {productOptions.length > 0 && (
                <select
                  value={productOptions.some((opt) => opt.value === product) ? product : ""}
                  onChange={(e) => {
                    setProduct(e.target.value);
                  }}
                  className="mb-1 h-9 rounded-md border border-input bg-background px-3 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  <option value="">Select product (optional)</option>
                  {productOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="Core membership"
                className="h-9 rounded-md border border-input bg-background px-3 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  UTM source
                </span>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="facebook / tiktok / email"
                  className="h-9 rounded-md border border-input bg-background px-3 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  UTM medium
                </span>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="cpc / social / feed"
                  className="h-9 rounded-md border border-input bg-background px-3 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-muted-foreground">
                  UTM campaign
                </span>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="launch_q1 / retargeting"
                  className="h-9 rounded-md border border-input bg-background px-3 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                />
              </label>
            </div>
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
