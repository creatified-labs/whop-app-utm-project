import React from "react";
import { Card } from "@whop/react/components";

type LinkRow = {
  name: string;
  slug: string;
  clicks: string;
};

const TOP_LINKS: LinkRow[] = [
  { name: "Main Landing Page", slug: "t/main-landing", clicks: "3.0k" },
  { name: "Email Welcome", slug: "t/welcome-flow", clicks: "1.2k" },
  { name: "Retargeting LP v2", slug: "t/retarget-v2", clicks: "842" },
  { name: "TikTok Top", slug: "t/tiktok-top", clicks: "451" },
];

export function ReportsTopLinksCard() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-white tracking-tight">Top Links</h2>
        <span className="text-[11px] text-slate-400 uppercase tracking-wide">
          By clicks
        </span>
      </div>

      <div className="space-y-3">
        {TOP_LINKS.map((link) => (
          <div
            key={link.slug}
            className="flex items-center justify-between gap-4 rounded-2xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/10 px-3.5 py-2.5 transition-all duration-200"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{link.name}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">/{link.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-100">
                {link.clicks}
              </span>
              <span className="text-xs text-slate-400">clicks</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
