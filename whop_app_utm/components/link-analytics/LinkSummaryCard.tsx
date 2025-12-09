import React from "react";
import { Card, Button } from "@whop/react/components";

const SHORT_TRACKING_URL = "https://appdomain.com/t/abc123";
const DESTINATION_URL =
  "https://your-landing-page.com/?utm_source=instagram&utm_medium=social&utm_campaign=launch_q1&utm_term=shoes&utm_content=hero_ad_v1";

export function LinkSummaryCard() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-6 lg:p-8 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01]"
    >
      <div className="space-y-6">
        {/* Tracking URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              Tracking URL
            </p>
            <Button
              size="1"
              variant="surface"
              color="gray"
              className="inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-100 text-xs shadow-md hover:shadow-xl transition-all duration-200"
            >
              <CopyIcon />
              Copy
            </Button>
          </div>
          <div className="rounded-2xl bg-black/40 border border-white/10 px-4 py-3 flex items-center justify-between gap-4">
            <span className="text-sm font-mono text-slate-200 truncate">
              {SHORT_TRACKING_URL}
            </span>
          </div>
        </div>

        {/* Destination URL */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Destination URL
          </p>
          <div className="rounded-2xl bg-black/40 border border-white/10 p-4 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto">
            {DESTINATION_URL}
          </div>
        </div>

        {/* UTM Parameters */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            UTM parameters
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UTMItem label="Source" value="instagram" />
            <UTMItem label="Medium" value="social" />
            <UTMItem label="Campaign" value="launch_q1" />
            <UTMItem label="Term" value="shoes" />
            <UTMItem label="Content" value="hero_ad_v1" />
          </div>
        </div>
      </div>
    </Card>
  );
}

type UTMItemProps = {
  label: string;
  value: string;
};

function UTMItem({ label, value }: UTMItemProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white/0 border border-white/5 px-3 py-2.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-100 font-mono truncate">{value}</span>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
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
