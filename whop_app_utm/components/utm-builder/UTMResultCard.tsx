import React from "react";
import { Card, Button } from "@whop/react/components";

const MOCK_SHORT_LINK = "https://appdomain.com/t/abc123";
const MOCK_UTM_QUERY =
  "utm_source=instagram&utm_medium=social&utm_campaign=launch_q1&utm_term=creators&utm_content=hero_video";

export function UTMResultCard() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">Generated Tracking Link</h3>
          <p className="text-xs text-slate-400 mt-1">
            Preview how this link will look once generated.
          </p>
        </div>
        <Button
          size="2"
          variant="surface"
          color="gray"
          className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-100 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-200"
        >
          <CopyIcon />
          <span className="text-xs font-medium">Copy Link</span>
        </Button>
      </div>

      <div className="mb-4 rounded-2xl bg-black/40 border border-white/10 px-4 py-3 flex items-center justify-between gap-4">
        <span className="text-sm font-mono text-slate-200 truncate">
          {MOCK_SHORT_LINK}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-[0.16em]">
          Full UTM query
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-slate-300 text-xs sm:text-sm overflow-x-auto">
{MOCK_UTM_QUERY}
        </pre>
      </div>
    </Card>
  );
}

function CopyIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="4"
        y="4"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.7"
      />
    </svg>
  );
}
