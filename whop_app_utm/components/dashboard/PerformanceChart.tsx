import React from "react";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
} from "@/components/ui/DashboardCard";

export function PerformanceChart() {
  // Mock data points for a smooth-ish curve
  const data = [
    120, 150, 180, 140, 90, 160, 220, 250, 310, 280, 260, 290
  ];
  const max = Math.max(...data);
  const min = 0;
  
  // Generate points for SVG polyline
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / (max - min)) * 80; // leave some top padding
    return `${x},${y}`;
  }).join(' ');

  return (
    <DashboardCard className="relative p-6 md:p-7 lg:p-8 h-full flex flex-col overflow-hidden group">
      {/* Grid Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <DashboardCardHeader className="relative z-10 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-neutral-100 tracking-tight">
            Clicks Over Time
          </h3>
          <p className="text-sm text-neutral-400">Performance trends</p>
        </div>
        <div className="text-xs font-medium text-neutral-100 bg-neutral-900/70 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          Last 30 Days
        </div>
      </DashboardCardHeader>

      {/* Chart Area */}
      <DashboardCardBody className="relative z-10 flex-1 w-full min-h-[240px] flex items-end mt-0">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Gradient Defs */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#38bdf8" // sky-400
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          />
          
          {/* Points */}
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((val - min) / (max - min)) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#0ea5e9"
                stroke="#e0f2fe"
                strokeWidth="0.5"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75"
              />
            );
          })}
        </svg>
      </DashboardCardBody>

      <div className="relative z-10 flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.6)]"></div>
          <span className="text-sm text-neutral-200 font-medium">Total Clicks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neutral-600"></div>
          <span className="text-sm text-neutral-400 font-medium">Unique Visitors</span>
        </div>
      </div>
    </DashboardCard>
  );
}
