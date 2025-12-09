"use client";

import React, { useState } from "react";
import { Button } from "@whop/react/components";

type Range = "7d" | "30d" | "90d" | "custom";

export function ReportsHeader() {
  const [range, setRange] = useState<Range>("30d");

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Reports</h1>
        <p className="text-slate-400 text-sm md:text-base">
          Deep-dive into campaigns, sources, and performance.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="inline-flex items-center p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
          <RangePill label="7d" active={range === "7d"} onClick={() => setRange("7d")} />
          <RangePill label="30d" active={range === "30d"} onClick={() => setRange("30d")} />
          <RangePill label="90d" active={range === "90d"} onClick={() => setRange("90d")} />
          <RangePill
            label="Custom"
            active={range === "custom"}
            onClick={() => setRange("custom")}
          />
        </div>

        <Button
          size="2"
          variant="surface"
          color="gray"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm font-medium text-slate-100 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>Export CSV</span>
        </Button>
      </div>
    </header>
  );
}

type RangePillProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function RangePill({ label, active, onClick }: RangePillProps) {
  return (
    <Button
      variant={active ? "surface" : "ghost"}
      size="2"
      color="gray"
      onClick={onClick}
      className={`!px-4 !py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
        active
          ? "text-white shadow-lg shadow-white/10 bg-white/20"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
      }`}
    >
      {label}
    </Button>
  );
}
