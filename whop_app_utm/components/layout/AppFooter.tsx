"use client";

import { ALL_PLANS, formatLimit, getPlanCapabilities } from "@/lib/plans";
import { useCurrentPlan } from "@/lib/useCurrentPlan";

export function AppFooter() {
	const { planId, capabilities, isLocalhost, setPlanId } = useCurrentPlan();

	return (
		<footer className="border-t border-white/10 bg-white/70 dark:bg-black/40 backdrop-blur-2xl">
			<div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
					<span>{capabilities.label} plan</span>
					<span>
						Widgets: {formatLimit(capabilities.maxWidgets)} max
					</span>
					<span>
						Links: {formatLimit(capabilities.maxLinks)} max
					</span>
					<span>Data: {capabilities.dataRetentionDays} days</span>
				</div>
				<div className="flex items-center gap-3">
					{isLocalhost && (
						<div className="inline-flex items-center rounded-full border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/10 backdrop-blur-xl px-1 py-0.5">
							{ALL_PLANS.map((id) => {
								const plan = getPlanCapabilities(id);
								const isActive = id === planId;
								return (
									<button
										key={id}
										type="button"
										onClick={() => setPlanId(id)}
										className={`px-2 py-0.5 text-[10px] rounded-full transition-all duration-200 ${isActive
											? "bg-black dark:bg-white text-white dark:text-black"
											: "text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10"
											}`}
									>
										{plan.label}
									</button>
								);
							})}
						</div>
					)}
					<span className="text-[11px] text-muted-foreground">Creatified UTM 2025</span>
				</div>
			</div>
		</footer>
	);
}
