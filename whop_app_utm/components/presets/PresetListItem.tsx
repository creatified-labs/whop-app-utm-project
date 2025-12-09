import React from "react";

export type PresetListItemData = {
  id: string;
  name: string;
  description: string;
  tag?: string;
};

type PresetListItemProps = {
  preset: PresetListItemData;
  active?: boolean;
  onClick?: () => void;
};

export function PresetListItem({ preset, active, onClick }: PresetListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border px-3.5 py-3 flex items-stretch gap-3 cursor-pointer relative overflow-hidden transition-all duration-200 group 
        ${
          active
            ? "bg-white/10 border-white/20 shadow-lg"
            : "bg-transparent border-white/5 hover:bg-white/5 hover:border-white/15"
        }
      `}
    >
      <div className="flex items-center gap-3 w-full">
        <div
          className={`w-1.5 h-8 rounded-full transition-all duration-200 ${
            active
              ? "bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
              : "bg-slate-600/70 group-hover:bg-slate-400/80"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white truncate">{preset.name}</p>
            {preset.tag && (
              <span className="px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wide bg-white/5 border border-white/10 text-slate-300">
                {preset.tag}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-400 truncate">{preset.description}</p>
        </div>
      </div>
    </button>
  );
}
