"use client";

import React, { useState } from 'react';
import { Button } from "@whop/react/components";

type Range = "7d" | "30d" | "90d";

export function Header() {
  const [range, setRange] = useState<Range>("7d");

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-base font-medium">Your tracking data at a glance.</p>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
          <DateRangeButton
            label="7d"
            active={range === "7d"}
            onClick={() => setRange("7d")}
          />
          <DateRangeButton
            label="30d"
            active={range === "30d"}
            onClick={() => setRange("30d")}
          />
          <DateRangeButton
            label="90d"
            active={range === "90d"}
            onClick={() => setRange("90d")}
          />
        </div>
        
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 border-2 border-white/10 shadow-lg relative cursor-pointer hover:scale-105 transition-transform">
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
        </div>
      </div>
    </header>
  );
}

function DateRangeButton({
  label,
  active,
  onClick,
}: {
  label: Range;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={active ? "surface" : "ghost"}
      size="2"
      color="gray"
      onClick={onClick}
      className={`!px-5 !py-1 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? 'text-white shadow-lg shadow-white/10 bg-white/20'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      {label}
    </Button>
  );
}
