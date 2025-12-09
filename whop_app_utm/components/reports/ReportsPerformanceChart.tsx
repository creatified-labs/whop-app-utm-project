import React from "react";
import { Card } from "@whop/react/components";

export function ReportsPerformanceChart() {
  const clicksPath =
    "M0 30 L10 26 L20 24 L30 20 L40 18 L50 16 L60 18 L70 15 L80 14 L90 13 L100 12";
  const revenuePath =
    "M0 34 L10 33 L20 31 L30 30 L40 29 L50 27 L60 26 L70 25 L80 24 L90 23 L100 22";

  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Performance Over Time
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Clicks and mock revenue trends across your campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Clicks</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Revenue</span>
          </span>
        </div>
      </div>

      <div className="relative w-full min-h-[220px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
        <svg viewBox="0 0 100 40" className="w-full h-full text-slate-500/40">
          {[8, 16, 24, 32].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.3"
            />
          ))}
          <defs>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${clicksPath} L100 40 L0 40 Z`}
            fill="url(#clicksGradient)"
            stroke="none"
          />
          <path
            d={clicksPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={revenuePath}
            fill="none"
            stroke="#4ade80"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="text-xs text-slate-400">
        Showing last 30 days across all active campaigns (mock data).
      </p>
    </Card>
  );
}
