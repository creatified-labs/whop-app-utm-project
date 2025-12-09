import React from "react";
import { Card } from "@whop/react/components";

type Source = {
  name: string;
  clicks: string;
  share: number;
};

const SOURCES: Source[] = [
  { name: "instagram", clicks: "4.2k", share: 1.0 },
  { name: "facebook", clicks: "2.8k", share: 0.68 },
  { name: "tiktok", clicks: "1.9k", share: 0.45 },
  { name: "email", clicks: "1.2k", share: 0.28 },
];

export function ReportsTopSourcesCard() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-white tracking-tight">Top Sources</h2>
        <span className="text-[11px] text-slate-400 uppercase tracking-wide">
          By clicks
        </span>
      </div>

      <div className="space-y-3">
        {SOURCES.map((source) => (
          <div key={source.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="font-medium capitalize text-slate-100">
                  {source.name}
                </span>
              </span>
              <span className="font-medium text-slate-100">{source.clicks} clicks</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
                style={{ width: `${Math.max(10, source.share * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
