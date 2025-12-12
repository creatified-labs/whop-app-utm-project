"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { BarChart3, Link as LinkIcon, Link2, TrendingUp, Settings } from "lucide-react";
import { useCurrentPlan } from "@/lib/useCurrentPlan";

type NavKey =
	| "overview"
	| "links"
	| "advancedLinks"
	| "analytics"
	| "presets"
	| "reports"
	| "settings";

interface NavItem {
	key: NavKey;
	href: string;
	label: string;
}

export function DashboardSidebar() {
	const params = useParams() as { companyId?: string };
	const pathname = usePathname() || "";
	const companyId = params.companyId ?? "company";
	const base = `/dashboard/${companyId}`;
	const { capabilities } = useCurrentPlan();

	const navItems: NavItem[] = [
		{ key: "overview", href: base, label: "Dashboard" },
		{ key: "links", href: `${base}/tracking-links`, label: "Whop tracking links" },
		{ key: "advancedLinks", href: `${base}/advanced-links`, label: "Advanced tracking links" },
		{ key: "analytics", href: `${base}/analytics`, label: "Analytics" },
		{ key: "settings", href: `${base}/settings`, label: "Settings" },
	];

	// Derive a simple section key from the pathname so we can highlight exactly
	// one nav pill regardless of embedding or query params.
	const getCurrentSection = (): NavKey => {
		const root = base;

		if (pathname === root || pathname === `${root}/`) {
			return "overview";
		}

		if (pathname.startsWith(`${root}/tracking-links`)) {
			return "links";
		}
		if (pathname.startsWith(`${root}/advanced-links`)) {
			return "advancedLinks";
		}
		if (pathname.startsWith(`${root}/analytics`)) {
			return "analytics";
		}
		if (pathname.startsWith(`${root}/settings`)) {
			return "settings";
		}
		if (pathname.startsWith(`${root}/presets`)) {
			return "presets";
		}
		if (pathname.startsWith(`${root}/reports`)) {
			return "reports";
		}

		// Default back to overview if we can't classify the route.
		return "overview";
	};

	const currentSection = getCurrentSection();

	const isActiveKey = (key: NavKey) => key === currentSection;

	const getIconForNavKey = (key: NavKey) => {
		switch (key) {
			case "overview":
				return <BarChart3 size={18} strokeWidth={2} />;
			case "links":
				return <LinkIcon size={18} strokeWidth={2} />;
			case "advancedLinks":
				return <Link2 size={18} strokeWidth={2} />;
			case "analytics":
				return <BarChart3 size={18} strokeWidth={2} />;
			case "presets":
				return <TrendingUp size={18} strokeWidth={2} />;
			case "reports":
				return <FlagIcon className="w-4 h-4" />;
			case "settings":
				return <Settings size={18} strokeWidth={2} />;
			default:
				return null;
		}
	};

	const primaryItems = navItems.filter((item) => item.key !== "settings");
	const settingsItem = navItems.find((item) => item.key === "settings");

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

	return (
		<header className="fixed inset-x-0 top-0 z-40 flex justify-center pt-3 pointer-events-none">
			<div className="max-w-4xl w-full mx-auto border border-white/40 dark:border-white/10 rounded-3xl px-4 sm:px-6 py-3 bg-white/70 dark:bg-black/40 backdrop-blur-2xl relative shadow-lg pointer-events-auto">
				<span className="absolute -top-3 left-4 inline-flex items-center rounded-full bg-black text-white dark:bg-white dark:text-black px-3 py-0.5 text-[11px] font-medium">
					{capabilities.label} plan
				</span>
				<div className="flex items-center justify-between gap-3 sm:gap-4">
					{/* Brand */}
					<div className="flex items-center gap-2 flex-shrink-0">
						<Link href={base} aria-label="Go to dashboard" className="flex items-center">
							<span className="font-sans text-[18px] leading-7 font-semibold tracking-tight text-gray-900 dark:text-neutral-50">
								Creatified UTM
							</span>
						</Link>
					</div>

					{/* Navigation: hidden on very small screens, visible from tablet up */}
					<nav className="hidden sm:flex items-center gap-1 flex-1 justify-center">
						{primaryItems.map((item) => {
							const active = isActiveKey(item.key);
							const icon = getIconForNavKey(item.key);

							return (
								<Link
									key={item.key}
									href={item.href}
									aria-label={item.label}
									className={`inline-flex items-center justify-center gap-2 rounded-2xl font-sans text-[14px] leading-5 font-semibold h-9 px-4 whitespace-nowrap transition-all duration-200 ${active
										? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
										: "text-gray-900 dark:text-neutral-50 hover:bg-white/10 dark:hover:bg-white/10"
										}`}
								>
									{icon && <span className="inline-flex">{icon}</span>}
									{/* Hide text labels only below md so they stay visible on most tablets */}
									<span className="hidden md:inline">{item.label}</span>
								</Link>
							);
						})}
					</nav>

					{/* Settings icon + mobile hamburger */}
					<div className="flex items-center gap-1 flex-shrink-0">
						{settingsItem && (
							<div className="relative">
								<button
									type="button"
									aria-label={settingsItem.label}
									onClick={() => setIsSettingsMenuOpen((open) => !open)}
									className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 dark:text-neutral-200 hover:bg-white/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
								>
									<Settings className="h-5 w-5" />
								</button>
								{isSettingsMenuOpen && (
									<div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/20 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-xl shadow-lg z-40 py-1 text-xs animate-in slide-in-from-top-2 fade-in duration-150">
										<Link
											key="account-settings"
											href={settingsItem.href}
											onClick={() => setIsSettingsMenuOpen(false)}
											className="flex w-full items-center justify-between px-3 py-2 text-foreground hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
										>
											<span>Account settings</span>
										</Link>
										<Link
											key="pricing"
											href="/pricing"
											onClick={() => setIsSettingsMenuOpen(false)}
											className="flex w-full items-center justify-between px-3 py-2 text-foreground hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
										>
											<span>Pricing</span>
										</Link>
									</div>
								)}
							</div>
						)}

						{/* Mobile hamburger menu: visible only on very small screens */}
						<button
							type="button"
							aria-label="Open navigation menu"
							className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 dark:text-neutral-200 hover:bg-white/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200 sm:hidden"
							onClick={() => setIsMobileMenuOpen((open) => !open)}
						>
							<MenuIcon className="h-5 w-5" />
						</button>
					</div>
				</div>

				{/* Mobile navigation menu (primary items only, no settings) */}
				{isMobileMenuOpen && (
					<div className="mt-2 sm:hidden border-t border-white/10 pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
						<nav className="flex flex-col gap-1">
							{primaryItems.map((item) => {
								const active = isActiveKey(item.key);
								const icon = getIconForNavKey(item.key);

								return (
									<Link
										key={item.key}
										href={item.href}
										aria-label={item.label}
										onClick={() => setIsMobileMenuOpen(false)}
										className={`w-full inline-flex items-center justify-between gap-3 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 ${active
											? "bg-[#050B1E] text-white dark:bg-white dark:text-black shadow-sm"
											: "text-gray-900 dark:text-neutral-50 hover:bg-white/10 dark:hover:bg-white/10"
											}`}
									>
										<span className="inline-flex items-center gap-2">
											{icon && <span className="inline-flex">{icon}</span>}
											<span>{item.label}</span>
										</span>
									</Link>
								);
							})}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}

// Icons from Flow Pilot template (inline SVG)

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M4 6h16" />
			<path d="M4 12h16" />
			<path d="M4 18h16" />
		</svg>
	);
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<rect width="18" height="18" x="3" y="3" rx="2" />
			<path d="M3 9h18" />
			<path d="M3 15h18" />
			<path d="M9 3v18" />
			<path d="M15 3v18" />
		</svg>
	);
}

function InboxIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
			<path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
		</svg>
	);
}

function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
			<path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
			<path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
		</svg>
	);
}

function FlagIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528" />
		</svg>
	);
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}

function RadarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
			<path d="M4 6h.01" />
			<path d="M2.29 9.62A10 10 0 1 0 21.31 8.35" />
			<path d="M16.24 7.76A6 6 0 1 0 8.23 16.67" />
			<path d="M12 18h.01" />
			<path d="M17.99 11.66A6 6 0 0 1 15.77 16.67" />
			<circle cx="12" cy="12" r="2" />
			<path d="m13.41 10.59 5.66-5.66" />
		</svg>
	);
}