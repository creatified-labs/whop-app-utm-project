"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LinkSummaryCard } from "@/components/link-analytics/LinkSummaryCard";
import { LinkStatCards } from "@/components/link-analytics/LinkStatCards";
import { LinkPerformanceChart } from "@/components/link-analytics/LinkPerformanceChart";
import { LinkBreakdownCards } from "@/components/link-analytics/LinkBreakdownCards";
import { LinkRecentClicksTable } from "@/components/link-analytics/LinkRecentClicksTable";

export default function LinkAnalyticsPage() {
  const params = useParams() as { companyId?: string };
  const companyId = params.companyId ?? "company";
  const base = `/dashboard/${companyId}`;

  return (
    <DashboardLayout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">
            <span className="text-slate-400">Links</span>
            <span className="mx-1.5 text-slate-600">›</span>
            <span className="text-slate-200">Main Landing Page</span>
          </p>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Main Landing Page</h1>
            <p className="text-slate-400 text-sm md:text-base">
              Analytics for this UTM tracking link.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Active
          </span>
          <Link
            href={`${base}/links`}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 text-sm font-medium text-slate-100 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200 backdrop-blur-xl"
          >
            <span className="inline-block rotate-180 text-slate-200">➜</span>
            <span>Back to Links</span>
          </Link>
        </div>
      </header>

      <div className="space-y-6">
        <LinkSummaryCard />
        <LinkStatCards />
        <LinkPerformanceChart />
        <LinkBreakdownCards />
        <LinkRecentClicksTable />
      </div>
    </DashboardLayout>
  );
}
