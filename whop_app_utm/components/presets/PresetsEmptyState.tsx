import React from "react";
import { Button } from "@whop/react/components";

export function PresetsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-10 rounded-2xl bg-white/5 backdrop-blur-xl border border-dashed border-white/15 hover:bg-white/10 hover:scale-[1.01] transition-all duration-200">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/40 to-indigo-500/40 border border-white/20 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
        <span className="text-base font-semibold">UTM</span>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-white tracking-tight">No presets yet</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Create your first preset to speed up link creation for your campaigns.
        </p>
      </div>
      <Button
        size="2"
        variant="surface"
        color="gray"
        className="mt-1 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-100 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
      >
        New Preset
      </Button>
    </div>
  );
}
