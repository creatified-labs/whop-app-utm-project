import React from "react";
import { Card } from "@whop/react/components";

const PRESETS = [
  "Instagram Feed",
  "Instagram Story",
  "Email Newsletter",
];

export function PresetButtons() {
  return (
    <Card
      size="2"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-6 py-5 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Presets</h3>
          <p className="text-xs text-slate-500">
            Quickly apply your go-to UTM patterns.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className="px-4 py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 hover:scale-[1.01] text-slate-100 border border-white/10 shadow-sm transition-all duration-200 backdrop-blur-md"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
