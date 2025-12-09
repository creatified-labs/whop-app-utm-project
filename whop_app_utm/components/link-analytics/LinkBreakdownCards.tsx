import React from "react";
import { Card } from "@whop/react/components";

const UTM_SOURCES = [
  { label: "instagram", clicks: 702, percent: 68 },
  { label: "facebook", clicks: 321, percent: 32 },
  { label: "tiktok", clicks: 180, percent: 18 },
];

const REFERRERS = [
  { label: "m.instagram.com", clicks: 521, percent: 72 },
  { label: "l.facebook.com", clicks: 287, percent: 40 },
  { label: "t.co", clicks: 92, percent: 13 },
];

export function LinkBreakdownCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BreakdownCard title="By UTM Source" items={UTM_SOURCES} />
      <BreakdownCard title="Top Referrers" items={REFERRERS} />
    </div>
  );
}

type BreakdownItem = {
  label: string;
  clicks: number;
  percent: number;
};

type BreakdownCardProps = {
  title: string;
  items: BreakdownItem[];
};

function BreakdownCard({ title, items }: BreakdownCardProps) {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-6 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01] flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium text-slate-100">{item.label}</span>
              <span className="font-mono tabular-nums text-slate-200">
                {item.clicks.toLocaleString()} clicks
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-400"
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
