export type PlanId = "free" | "growth" | "pro";

export type ReportsLevel = "none" | "basic" | "advanced";
export type ExportsLevel = "none" | "basic" | "advanced";

export type PlanCapabilities = {
	id: PlanId;
	label: string;
	maxWidgets: number | null; // null = unlimited
	maxLinks: number | null; // null = unlimited
	dataRetentionDays: number;
	canUseProWidgets: boolean;
	canUseAdvancedUtmSegments: boolean;
	reportsLevel: ReportsLevel;
	exportsLevel: ExportsLevel;
};

const PLAN_CAPABILITIES: Record<PlanId, PlanCapabilities> = {
	free: {
		id: "free",
		label: "Free",
		maxWidgets: 4,
		maxLinks: 5,
		dataRetentionDays: 30,
		canUseProWidgets: false,
		canUseAdvancedUtmSegments: false,
		reportsLevel: "none",
		exportsLevel: "none",
	},
	growth: {
		id: "growth",
		label: "Growth",
		maxWidgets: 8,
		maxLinks: 15,
		dataRetentionDays: 90,
		canUseProWidgets: false,
		canUseAdvancedUtmSegments: true,
		reportsLevel: "basic",
		exportsLevel: "basic",
	},
	pro: {
		id: "pro",
		label: "Pro",
		maxWidgets: null,
		maxLinks: null,
		dataRetentionDays: 365,
		canUseProWidgets: true,
		canUseAdvancedUtmSegments: true,
		reportsLevel: "advanced",
		exportsLevel: "advanced",
	},
};

export const ALL_PLANS: PlanId[] = ["free", "growth", "pro"];

export function getPlanCapabilities(planId: PlanId): PlanCapabilities {
	return PLAN_CAPABILITIES[planId];
}

export function formatLimit(limit: number | null): string {
	if (limit == null) return "Unlimited";
	return String(limit);
}
