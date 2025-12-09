"use client";

import React, { useState } from "react";
import { Card, Button } from "@whop/react/components";

type Range = "7d" | "30d" | "90d";

const MOCK_DATA: Record<Range, number[]> = {
  "7d": [120, 180, 90, 220, 310, 260, 290],
  "30d": [80, 140, 110, 200, 260, 230, 240, 260, 280, 300, 320, 310],
  "90d": [60, 90, 70, 120, 160, 150, 200, 260, 210, 240, 280, 260, 300, 320, 340],
};

export function LinkPerformanceChart() {
  const [range, setRange] = useState<Range>("7d");

  const data = MOCK_DATA[range];
  const max = Math.max(...data);
  const min = 0;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / (max - min)) * 80;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Card
      size="3"
      variant="surface"
      className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01] flex flex-col gap-6 overflow-hidden group"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">Clicks Over Time</h3>
          <p className="text-xs text-slate-400 mt-1">Performance for this link</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-1.5 py-1 backdrop-blur-md">
          <RangePill label="7d" active={range === "7d"} onClick={() => setRange("7d")} />
          <RangePill label="30d" active={range === "30d"} onClick={() => setRange("30d")} />
          <RangePill label="90d" active={range === "90d"} onClick={() => setRange("90d")} />
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(248,250,252,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(248,250,252,0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <svg
          className="relative w-full h-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="linkChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#linkChartGradient)"
          />

          <polyline
            points={points}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          />

          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value - min) / (max - min)) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={1.5}
                fill="#0ea5e9"
                stroke="#e0f2fe"
                strokeWidth={0.5}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center gap-6 pt-3 border-t border-white/5">
        <LegendDot color="bg-sky-400" label="Total Clicks" />
        <LegendDot color="bg-slate-500" label="Unique Visitors" subtle />
      </div>
    </Card>
  );
}

type RangePillProps = {
  label: Range;
  active: boolean;
  onClick: () => void;
};

function RangePill({ label, active, onClick }: RangePillProps) {
  return (
    <Button
      size="1"
      variant={active ? "surface" : "ghost"}
      color="gray"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-150 ${
        active
          ? "bg-white/20 text-white shadow-sm"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Button>
  );
}

type LegendDotProps = {
  color: string;
  label: string;
  subtle?: boolean;
};

function LegendDot({ color, label, subtle }: LegendDotProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span
        className={`w-2.5 h-2.5 rounded-full ${color} ${
          subtle ? "opacity-70" : "shadow-[0_0_10px_rgba(56,189,248,0.6)]"
        }`}
      />
      <span>{label}</span>
    </div>
  );
}
