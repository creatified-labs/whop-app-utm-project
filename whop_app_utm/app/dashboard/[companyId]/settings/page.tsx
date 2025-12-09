"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
	DashboardCard,
	DashboardCardHeader,
	DashboardCardBody,
} from "@/components/ui/DashboardCard";
import { useCurrentPlan } from "@/lib/useCurrentPlan";

export default function SettingsPage() {
	const { planId } = useCurrentPlan();
	const isPro = planId === "pro";
	const params = useParams() as { companyId?: string };
	const companyId = params.companyId ?? "workspace";

	const [metaPixelId, setMetaPixelId] = useState("");
	const [initialLoaded, setInitialLoaded] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

	useEffect(() => {
		let cancelled = false;
		async function load() {
			try {
				const res = await fetch(`/api/meta-pixel?companyId=${encodeURIComponent(companyId)}`);
				if (!res.ok) return;
				const data = (await res.json()) as { metaPixelId?: string | null };
				if (!cancelled && data.metaPixelId) {
					setMetaPixelId(data.metaPixelId);
				}
			} finally {
				if (!cancelled) setInitialLoaded(true);
			}
		}
		void load();
		return () => {
			cancelled = true;
		};
	}, [companyId]);

	const handleSave = async () => {
		setIsSaving(true);
		setStatus("idle");
		try {
			const res = await fetch("/api/meta-pixel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ companyId, metaPixelId: metaPixelId.trim() || null }),
			});
			if (!res.ok) {
				setStatus("error");
				return;
			}
			setStatus("saved");
		} catch {
			setStatus("error");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="mt-2 space-y-3">
			<DashboardCard className="p-4 sm:p-5 md:p-6">
				<DashboardCardHeader>
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
						Meta Pixel
					</p>
				</DashboardCardHeader>
				<DashboardCardBody>
					{!isPro ? (
						<div className="space-y-2 text-sm text-neutral-300">
							<p>
								Meta Pixel integration is available on the Pro plan.
							</p>
							<p>
								Upgrade on the pricing page to connect your Facebook / Meta
								pixel for conversion tracking.
							</p>
						</div>
					) : (
						<div className="space-y-3 text-sm text-neutral-200">
							<p className="text-neutral-300">
								Add your Meta (Facebook) Pixel ID to fire page view and
								conversion events from this workspace.
							</p>
							<div className="space-y-1">
								<label className="block text-xs font-medium uppercase tracking-wide text-neutral-400">
									Meta Pixel ID
								</label>
								<input
									type="text"
									value={metaPixelId}
									onChange={(e) => setMetaPixelId(e.target.value)}
									placeholder="e.g. 123456789012345"
									className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-[#050505] dark:text-neutral-50"
									disabled={!initialLoaded || isSaving}
								/>
							</div>
							<div className="flex items-center gap-3 pt-1">
								<button
									type="button"
									onClick={handleSave}
									disabled={isSaving || !initialLoaded}
									className="inline-flex items-center justify-center rounded-full bg-black text-white text-sm font-semibold h-8 px-4 disabled:opacity-60"
								>
									{isSaving ? "Saving..." : "Save"}
								</button>
								{status === "saved" && (
									<span className="text-xs text-emerald-400">
										Saved
									</span>
								)}
								{status === "error" && (
									<span className="text-xs text-red-400">
										Couldn’t save. Try again.
									</span>
								)}
							</div>
						</div>
					)}
				</DashboardCardBody>
			</DashboardCard>
		</div>
	);
}
