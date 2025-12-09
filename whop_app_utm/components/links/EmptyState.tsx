import React from "react";
import { Button } from "@whop/react/components";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-16 rounded-3xl bg-white/5 backdrop-blur-xl border border-dashed border-white/15 hover:bg-white/10 hover:scale-[1.01] transition-all duration-200">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/40 to-indigo-500/40 border border-white/20 flex items-center justify-center text-white shadow-xl shadow-sky-500/30">
        <span className="text-lg font-semibold">UTM</span>
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white tracking-tight">No Links Yet</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Start by creating your first UTM tracking link to see it appear in your links table.
        </p>
      </div>
      <Button
        size="2"
        variant="surface"
        color="gray"
        className="mt-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-100 shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-200"
      >
        Create Link
      </Button>
    </div>
  );
}
