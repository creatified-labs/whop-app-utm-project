import React from "react";
import { Card } from "@whop/react/components";

const RECENT_CLICKS = [
  {
    time: "2 min ago",
    country: "UK",
    device: "Mobile",
    referrer: "m.instagram.com/posts/123...",
    ip: "ab3f…92c",
  },
  {
    time: "12 min ago",
    country: "US",
    device: "Desktop",
    referrer: "l.facebook.com/click?id=...",
    ip: "c7d1…08e",
  },
  {
    time: "32 min ago",
    country: "DE",
    device: "Desktop",
    referrer: "t.co/xyz...",
    ip: "e19a…4bd",
  },
  {
    time: "1 hour ago",
    country: "CA",
    device: "Mobile",
    referrer: "m.instagram.com/story/...",
    ip: "f4c2…7aa",
  },
  {
    time: "2 hours ago",
    country: "FR",
    device: "Mobile",
    referrer: "m.instagram.com/ads/...",
    ip: "91ac…1f0",
  },
  {
    time: "6 hours ago",
    country: "US",
    device: "Tablet",
    referrer: "l.facebook.com/click?id=...",
    ip: "7de4…c19",
  },
];

export function LinkRecentClicksTable() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-6 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01] overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Recent Clicks</h3>
          <p className="text-xs text-slate-500 mt-1">Most recent activity for this link</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="min-w-[720px] w-full text-left text-sm text-slate-300 border-separate border-spacing-0">
          <thead>
            <tr className="text-xs uppercase tracking-[0.16em] text-slate-500 border-b border-white/5">
              <th className="py-3 pl-2 pr-4 font-medium">Time</th>
              <th className="py-3 px-4 font-medium">Country</th>
              <th className="py-3 px-4 font-medium">Device</th>
              <th className="py-3 px-4 font-medium">Referrer</th>
              <th className="py-3 px-4 font-medium text-right">IP Hash</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_CLICKS.map((click) => (
              <tr
                key={`${click.time}-${click.ip}`}
                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 pl-2 pr-4 text-xs sm:text-sm text-slate-200">
                  {click.time}
                </td>
                <td className="py-3 px-4 text-xs sm:text-sm text-slate-300">
                  {click.country}
                </td>
                <td className="py-3 px-4 text-xs sm:text-sm text-slate-300">
                  {click.device}
                </td>
                <td className="py-3 px-4 text-xs sm:text-sm text-slate-300 max-w-[260px] truncate">
                  {click.referrer}
                </td>
                <td className="py-3 px-4 text-xs text-right font-mono text-slate-400">
                  {click.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
