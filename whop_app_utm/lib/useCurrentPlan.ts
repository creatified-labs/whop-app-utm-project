"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ALL_PLANS, getPlanCapabilities, type PlanCapabilities, type PlanId } from "@/lib/plans";

const STORAGE_KEY = "creatified_utm_plan";

interface CurrentPlanContextValue {
	planId: PlanId;
	capabilities: PlanCapabilities;
	isLocalhost: boolean;
	setPlanId: (next: PlanId) => void;
}

const CurrentPlanContext = createContext<CurrentPlanContextValue | undefined>(undefined);

export function CurrentPlanProvider({ children }: { children: React.ReactNode }) {
	const [planId, setPlanIdState] = useState<PlanId>("free");
	const [isLocalhost, setIsLocalhost] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const hostname = window.location.hostname;
		const local = hostname === "localhost" || hostname === "127.0.0.1";
		setIsLocalhost(local);

		try {
			const stored = window.localStorage.getItem(STORAGE_KEY) as PlanId | null;
			if (stored && (ALL_PLANS as readonly string[]).includes(stored)) {
				setPlanIdState(stored);
			}
		} catch {
			// Ignore localStorage errors; fall back to default plan.
		}

		// In local development, respect the footer toggle + localStorage only and
		// avoid overriding with real billing state. This keeps localhost testing
		// flexible regardless of production subscriptions.
		if (local) {
			return;
		}

		// Best-effort: if we're on a company dashboard route (non-localhost), try
		// to load the plan from the backend so that real billing state (from
		// webhooks) wins over any local overrides.
		try {
			const pathname = window.location.pathname;
			const match = /^\/dashboard\/([^/]+)/.exec(pathname);
			const companyId = match?.[1];

			if (companyId) {
				void (async () => {
					try {
						const res = await fetch(
							`/api/company-plan?companyId=${encodeURIComponent(companyId)}`,
						);
						if (!res.ok) return;
						const data = (await res.json()) as { planId?: PlanId | null };
						if (
							data.planId &&
							(Array.isArray(ALL_PLANS) as boolean) &&
							(ALL_PLANS as readonly string[]).includes(data.planId)
						) {
							setPlanIdState(data.planId);
							try {
								window.localStorage.setItem(STORAGE_KEY, data.planId);
							} catch {
								// Ignore persistence errors.
							}
						}
					} catch {
						// Ignore network errors; keep local plan state.
					}
				})();
			}
		} catch {
			// Ignore pathname parsing errors.
		}
	}, []);

	const setPlanId = (next: PlanId) => {
		setPlanIdState(next);
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Ignore persistence failure; runtime state still updated.
		}
	};

	const capabilities = getPlanCapabilities(planId);

	const value = useMemo<CurrentPlanContextValue>(
		() => ({ planId, capabilities, isLocalhost, setPlanId }),
		[planId, capabilities, isLocalhost],
	);

	return React.createElement(CurrentPlanContext.Provider, { value }, children);
}

export function useCurrentPlan(): CurrentPlanContextValue {
	const ctx = useContext(CurrentPlanContext);
	if (!ctx) {
		throw new Error("useCurrentPlan must be used within a CurrentPlanProvider");
	}
	return ctx;
}
