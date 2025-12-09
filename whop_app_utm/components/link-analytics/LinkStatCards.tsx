import React from "react";
import { Card, Badge } from "@whop/react/components";

const STATS = [
  { label: "Total Clicks", value: "1,203", trend: "+12.4%", trendLabel: "vs last 7d" },
  { label: "Unique Visitors", value: "842", trend: "+5.2%", trendLabel: "vs last 7d" },
  { label: "CTR", value: "4.2%", trend: "+0.8pp", trendLabel: "vs last 7d" },
  { label: "Last Click", value: "2 hours ago", trend: "Active", trendLabel: "link status" },
];

export function LinkStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {STATS.map((stat) => (
        <Card
          key={stat.label}
          size="3"
          variant="surface"
          className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-5 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">{stat.label}</span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white tracking-tight">
              {stat.value}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                color="green"
                variant="soft"
                className="text-[11px] px-2 py-0.5 font-semibold rounded-md"
              >
                {stat.trend}
              </Badge>
              <span className="text-[11px] text-slate-500">{stat.trendLabel}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
