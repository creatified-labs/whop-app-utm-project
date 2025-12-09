"use client";

import React, { useState } from "react";
import { Card } from "@whop/react/components";
import { PresetsEmptyState } from "./PresetsEmptyState";
import { PresetListItem, PresetListItemData } from "./PresetListItem";

const MOCK_PRESETS: PresetListItemData[] = [
  {
    id: "instagram-feed",
    name: "Instagram Feed",
    description: "source: instagram | medium: social | campaign: launch_q1",
    tag: "Social",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    description: "source: instagram | medium: story | campaign: launch_q1_ret",
    tag: "Social",
  },
  {
    id: "email-newsletter",
    name: "Email Newsletter",
    description: "source: newsletter | medium: email | campaign: weekly_updates",
    tag: "Lifecycle",
  },
];

export function PresetsList() {
  const [activeId, setActiveId] = useState<string>(MOCK_PRESETS[0]?.id ?? "");

  const hasPresets = MOCK_PRESETS.length > 0;

  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 lg:p-5 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-white tracking-tight">Saved Presets</h2>
          <p className="text-xs text-slate-400">Speed up link creation with reusable UTM sets.</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
          {MOCK_PRESETS.length} presets
        </div>
      </div>

      {hasPresets ? (
        <div className="mt-1 space-y-2">
          {MOCK_PRESETS.map((preset) => (
            <PresetListItem
              key={preset.id}
              preset={preset}
              active={preset.id === activeId}
              onClick={() => setActiveId(preset.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-2">
          <PresetsEmptyState />
        </div>
      )}
    </Card>
  );
}
