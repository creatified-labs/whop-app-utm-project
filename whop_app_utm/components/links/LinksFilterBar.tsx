import React from "react";

export function LinksFilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-lg hover:shadow-xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search links..."
          className="frosted-input w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400/70 transition-all duration-150"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="min-w-[160px]">
          <select
            className="frosted-input w-full rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:border-sky-400/70 appearance-none pr-8 placeholder:text-white/30"
            defaultValue="all"
          >
            <option value="all">All campaigns</option>
            <option value="launch_q1">Launch Q1</option>
            <option value="retargeting">Retargeting</option>
            <option value="welcome_flow">Welcome Flow</option>
          </select>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-100 hover:bg-white/10 hover:scale-[1.01] transition-all duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Date range: Last 30 days</span>
        </button>

        <button
          type="button"
          className="text-xs font-medium text-slate-400 hover:text-slate-100 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
