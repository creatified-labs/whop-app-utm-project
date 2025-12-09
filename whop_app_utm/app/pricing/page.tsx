"use client";

import { useMemo } from "react";
import { Check, X, Zap, Shield } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useCurrentPlan } from "@/lib/useCurrentPlan";

type PlanFeature = {
	label: string;
	free: { included: boolean; detail?: string };
	growth: { included: boolean; detail?: string };
	pro: { included: boolean; detail?: string };
};

type PlanId = "free" | "growth" | "pro";

type PlanConfig = {
	id: PlanId;
	name: string;
	price: string;
	period: string;
	description: string;
	badge?: string;
	icon: typeof Zap;
	buttonText: string;
	highlighted?: boolean;
	checkoutKind?: "growth" | "pro";
};

const ENV: Record<string, string | undefined> = {
	NEXT_PUBLIC_WHOP_GROWTH_PLAN_ID: process.env.NEXT_PUBLIC_WHOP_GROWTH_PLAN_ID,
	NEXT_PUBLIC_WHOP_PRO_PLAN_ID: process.env.NEXT_PUBLIC_WHOP_PRO_PLAN_ID,
	NEXT_PUBLIC_WHOP_FREE_PLAN_ID: process.env.NEXT_PUBLIC_WHOP_FREE_PLAN_ID,
};

function resolveCheckoutId(keys: string[]): string | undefined {
	for (const key of keys) {
		const value = ENV[key];
		if (typeof value === "string" && value.trim() && value !== "undefined") {
			return value.trim();
		}
	}
	return undefined;
}

const checkoutIds: Record<"growth" | "pro", string | undefined> = {
	growth: resolveCheckoutId(["NEXT_PUBLIC_WHOP_GROWTH_PLAN_ID"]),
	pro: resolveCheckoutId(["NEXT_PUBLIC_WHOP_PRO_PLAN_ID"]),
};

function getCheckoutUrl(kind: "growth" | "pro") {
	const id = checkoutIds[kind];
	if (!id) {
		if (process.env.NODE_ENV !== "production") {
			console.warn(
				`Missing Whop checkout identifier for ${kind} plan. Set NEXT_PUBLIC_WHOP_${kind.toUpperCase()}_PLAN_ID.`,
			);
		}
		return undefined;
	}
	return `https://whop.com/checkout/${id}`;
}

const freeCheckoutId =
	resolveCheckoutId(["NEXT_PUBLIC_WHOP_FREE_PLAN_ID"]) || "plan_XySkQj2YjXRvx";

function getFreeCheckoutUrl() {
	if (!freeCheckoutId) {
		if (process.env.NODE_ENV !== "production") {
			console.warn(
				"Missing Whop checkout identifier for free plan. Set NEXT_PUBLIC_WHOP_FREE_PLAN_ID or rely on the default listing id.",
			);
		}
		return undefined;
	}
	return `https://whop.com/checkout/${freeCheckoutId}`;
}

const features: PlanFeature[] = [
	{
		label: "Advanced tracking links",
		free: { included: true, detail: "Up to 5, slug only" },
		growth: { included: true, detail: "Up to 15, full UTM controls" },
		pro: { included: true, detail: "Unlimited links" },
	},
	{
		label: "Dashboard widgets",
		free: { included: true, detail: "4 core widgets" },
		growth: { included: true, detail: "Up to 8 widgets" },
		pro: { included: true, detail: "Unlimited + pro widgets" },
	},
	{
		label: "Filters & segments",
		free: { included: true, detail: "Search only" },
		growth: { included: true, detail: "Link, product & basic filters" },
		pro: { included: true, detail: "Full filter set + advanced UTMs" },
	},
	{
		label: "Reports & exports",
		free: { included: false, detail: "Dashboard only" },
		growth: { included: true, detail: "Core reports + CSV (coming soon)" },
		pro: { included: true, detail: "Advanced reports & exports" },
	},
	{
		label: "Data retention",
		free: { included: true, detail: "30 days" },
		growth: { included: true, detail: "90 days" },
		pro: { included: true, detail: "12 months" },
	},
	{
		label: "Support",
		free: { included: true, detail: "Email, best-effort" },
		growth: { included: true, detail: "Email support" },
		pro: { included: true, detail: "Priority support" },
	},
];

const plans: PlanConfig[] = [
	{
		id: "free",
		name: "Free",
		price: "$0",
		period: "/month",
		description: "For getting started with Creatified UTM.",
		icon: Zap,
		buttonText: "Start for free",
		highlighted: false,
	},
	{
		id: "growth",
		name: "Growth",
		price: "$49",
		period: "/month",
		description: "For growing brands tracking serious campaigns.",
		badge: "Most popular",
		icon: Zap,
		buttonText: "Start free trial",
		highlighted: true,
		checkoutKind: "growth",
	},
	{
		id: "pro",
		name: "Pro",
		price: "$149",
		period: "/month",
		description: "For teams needing deep attribution and reporting.",
		icon: Shield,
		buttonText: "Start free trial",
		highlighted: false,
		checkoutKind: "pro",
	},
];

const faqs = [
	{
		question: "How is Creatified UTM different from tools like Hyros?",
		answer:
			"Hyros is built for bigger teams with complex ad setups and higher price points. Creatified UTM gives you focused UTM tracking, dashboards, and revenue attribution at a fraction of the price, so you can grow into those tools later if you need them.",
	},
	{
		question: "Can I start on Free and upgrade later?",
		answer:
			"Yes. You can start on the Free plan, then upgrade to Growth or Pro at any time. Your existing links and data stay intact when you change plans.",
	},
	{
		question: "What happens if I hit my plan limits?",
		answer:
			"Inside the app, we’ll show a clear upgrade message when you reach link or widget limits. You can upgrade in a couple of clicks to unlock more capacity.",
	},
	{
		question: "Do you offer support if I get stuck?",
		answer:
			"Yes. You can always reach us at creatifiedlabs@gmail.com. Growth and Pro customers also get faster responses and help tuning their tracking setup.",
	},
];

export default function PricingPage() {
	const { planId, setPlanId } = useCurrentPlan();
	const orderedPlans = useMemo(() => plans, []);

	return (
		<div className="relative min-h-screen bg-background text-foreground antialiased">
			<main className="min-h-screen flex flex-col pt-20">
				<header className="px-4 sm:px-6 lg:px-10 pt-4 pb-3">
					<div className="flex items-center gap-3">
						<div className="flex-1 max-w-4xl mx-auto">
							<DashboardSidebar />
						</div>
					</div>
				</header>

				<div className="flex-1 px-4 sm:px-6 lg:px-10 pb-8">
					<section className="mt-4 max-w-7xl mx-auto">
						{/* Header */}
						<div className="text-center mb-10">
							<p className="text-[50px] sm:text-sm font-semibold text-primary dark:text-white mb-2 uppercase tracking-wide">
								Pricing for Creatified UTM
							</p>
							<h1 className="text-[28px] md:text-4xl font-semibold tracking-tight text-foreground">
								Grow from first clicks to serious revenue.
							</h1>
							<p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground">
								Start for free, then upgrade when you need more widgets, advanced links, and attribution. Inspired by tools like Hyros, but priced for creators and lean teams.
							</p>
						</div>

						{/* Pricing Cards */}
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{orderedPlans.map((plan) => {
								const Icon = plan.icon;
								const isHighlight = Boolean(plan.highlighted);
								const isCurrentPlan = plan.id === planId;

								if (isHighlight) {
									return (
										<div
											key={plan.id}
											className="group relative flex h-full flex-col rounded-xl border border-black/10 bg-gradient-to-tr from-black/[0.85] via-black/[0.90] to-black/[0.95] ring-1 ring-black/[0.06] p-6 transition-all duration-300 hover:-translate-y-1 hover:ring-black/10 dark:border-transparent dark:ring-white/10 dark:bg-white dark:shadow-[0_18px_60px_rgba(15,23,42,0.45)] transform lg:scale-[1.05] growth-plan-animated"
										>
											{plan.badge && (
												<div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
													<div className="px-4 py-1 text-xs font-semibold rounded-full bg-white text-black shadow-md dark:bg-black dark:text-white dark:shadow-lg">
														{plan.badge}
													</div>
												</div>
											)}

											<div className="flex items-center justify-between mb-4">
												<h3 className="text-[24px] font-semibold text-white dark:text-black">
													{plan.name}
												</h3>
												<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 ring-1 ring-white/20 dark:bg-neutral-900 dark:ring-neutral-700">
													<Icon className="w-4 h-4 text-white dark:text-black" />
												</div>
											</div>

											<div className="mb-6">
												<div className="flex items-baseline">
													<span className="text-3xl font-semibold text-white dark:text-black">
														{plan.price}
													</span>
													{plan.period && (
														<span className="ml-1 text-white/70 dark:text-black">
															{plan.period}
														</span>
													)}
												</div>
												<p className="text-sm text-white/70 dark:text-black mt-1">
													{plan.description}
												</p>
											</div>

											<ul className="space-y-3 mb-6">
												{features.map((feature) => {
													const planFeature = feature[plan.id];
													return (
														<li key={feature.label} className="flex items-center gap-3 text-sm">
															<span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 shrink-0">
																{planFeature.included ? (
																	<Check className="h-3.5 w-3.5 text-white dark:text-black" />
																) : (
																	<X className="h-3.5 w-3.5 text-red-400" />
																)}
															</span>
															<span className="text-white/90 dark:text-black">
																{feature.label}
															</span>
															<span className="ml-auto text-white/60 dark:text-black text-xs text-right shrink-0 whitespace-nowrap">
																{planFeature.detail}
															</span>
														</li>
													);
												})}
											</ul>

											<div className="flex flex-1" />
											<button
												type="button"
												disabled={isCurrentPlan}
												onClick={() => {
													if (isCurrentPlan) return;
													if (!plan.checkoutKind) return;
													const url = getCheckoutUrl(plan.checkoutKind);
													if (url) {
														setPlanId(plan.id);
														window.open(url, "_blank", "noopener,noreferrer");
													}
												}}
												className={`mt-auto w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 transition-colors shadow-md hover:shadow-lg ${isCurrentPlan
													? "bg-white text-neutral-900 cursor-default dark:bg-black dark:text-white"
													: "bg-white text-neutral-900 hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/80"
													}`}
											>
												{isCurrentPlan ? "Current plan" : plan.buttonText}
											</button>
										</div>
									);
								}

								// Free and Pro cards (non-highlight)
								return (
									<div
										key={plan.id}
										className="relative flex h-full flex-col rounded-xl border border-transparent bg-card shadow-[0_18px_60px_rgba(15,23,42,0.18)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.22)]"
									>
										<div className="flex items-center justify-between mb-4">
											<h3 className="text-[24px] font-semibold text-foreground dark:text-neutral-900">
												{plan.name}
											</h3>
											<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted dark:bg-neutral-900">
												<Icon className="w-4 h-4 text-muted-foreground dark:text-neutral-900" />
											</div>
										</div>
										<div className="mb-6">
											<div className="flex items-baseline">
												<span className="text-3xl font-semibold text-foreground dark:text-neutral-900">
													{plan.price}
												</span>
												{plan.period && (
													<span className="ml-1 text-muted-foreground dark:text-neutral-600">
														{plan.period}
													</span>
												)}
											</div>
											<p className="text-sm text-muted-foreground dark:text-neutral-700 mt-1">
												{plan.description}
											</p>
										</div>
										<ul className="space-y-3 mb-6">
											{features.map((feature) => {
												const planFeature = feature[plan.id];
												return (
													<li key={feature.label} className="flex items-center gap-3 text-sm">
														<span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-muted ring-1 ring-border/20 shrink-0">
															{planFeature.included ? (
																<Check className="h-3.5 w-3.5 text-emerald-500" />
															) : (
																<X className="h-3.5 w-3.5 text-red-500" />
															)}
														</span>
														<span className="text-foreground dark:text-neutral-900">
															{feature.label}
														</span>
														<span className="ml-auto text-muted-foreground dark:text-neutral-600 text-xs text-right shrink-0 whitespace-nowrap">
															{planFeature.detail}
														</span>
													</li>
												);
											})}
										</ul>
										<button
											type="button"
											disabled={isCurrentPlan}
											onClick={() => {
												if (plan.id === "free") {
													setPlanId("free");
													const url = getFreeCheckoutUrl();
													if (url) {
														window.open(url, "_blank", "noopener,noreferrer");
													}
													return;
												}
												if (isCurrentPlan) return;
												if (!plan.checkoutKind) return;
												const url = getCheckoutUrl(plan.checkoutKind);
												if (url) {
													setPlanId(plan.id);
													window.open(url, "_blank", "noopener,noreferrer");
												}
											}}
											className={`mt-auto w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 transition-colors shadow-md hover:shadow-lg ${isCurrentPlan
												? "bg-white text-neutral-900 cursor-default dark:bg-black dark:text-white"
												: "bg-background text-neutral-900 hover:bg-muted dark:bg-black dark:text-white dark:hover:bg-black/80"
												}`}
										>
											{isCurrentPlan ? "Current plan" : plan.buttonText}
										</button>
									</div>
								);
							})}
						</div>

						{/* FAQ Section */}
						<div className="mt-12 max-w-4xl mx-auto">
							<h2 className="text-[28px] font-semibold tracking-tight text-center mb-8 text-foreground">
								Frequently asked questions
							</h2>
							<div className="space-y-4">
								{faqs.map((faq) => (
									<div key={faq.question} className="rounded-xl border border-border bg-card/70 p-5">
										<h3 className="font-semibold mb-1 text-foreground">{faq.question}</h3>
										<p className="text-sm text-muted-foreground">{faq.answer}</p>
									</div>
								))}
							</div>
						</div>
					</section>
				</div>
			</main>
		</div>
	);
}
