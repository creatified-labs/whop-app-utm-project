import React from "react";
import { Card } from "@whop/react/components";

const METRICS = [
  {
    label: "Total Clicks (last 30d)",
    value: "24.3k",
    delta: "+8.1% vs last 30d",
  },
  {
    label: "Unique Visitors",
    value: "9.7k",
    delta: "+3.4% vs last period",
  },
  {
    label: "Active Campaigns",
    value: "12",
    delta: "4 paused",
  },
  {
    label: "Best Performing Source",
    value: "Instagram · 4.2k clicks",
    delta: "Top 38% of traffic",
  },
];

export function ReportsSummaryCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {METRICS.map((metric) => (
        <Card
          key={metric.label}
          size="3"
          variant="surface"
          className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-4 lg:p-5 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01] flex flex-col gap-3"
        >
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {metric.label}
          </p>
          <p className="text-2xl font-semibold text-white tracking-tight">{metric.value}</p>
          <span className="inline-flex items-center self-start rounded-full px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
            {metric.delta}
          </span>
        </Card>
      ))}
    </div>
  );
}
