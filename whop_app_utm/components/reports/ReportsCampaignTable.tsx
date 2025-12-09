import React from "react";
import { Card } from "@whop/react/components";

type Campaign = {
  name: string;
  clicks: string;
  visitors: string;
  conversionRate: string;
  revenue: string;
  status: "Active" | "Paused";
};

const CAMPAIGNS: Campaign[] = [
  {
    name: "launch_q1",
    clicks: "8,432",
    visitors: "3,921",
    conversionRate: "4.8%",
    revenue: "$42,930",
    status: "Active",
  },
  {
    name: "retargeting_q1",
    clicks: "5,104",
    visitors: "2,387",
    conversionRate: "5.6%",
    revenue: "$28,410",
    status: "Active",
  },
  {
    name: "evergreen_offer",
    clicks: "3,289",
    visitors: "1,904",
    conversionRate: "3.2%",
    revenue: "$15,230",
    status: "Paused",
  },
  {
    name: "welcome_flow",
    clicks: "2,178",
    visitors: "1,102",
    conversionRate: "6.1%",
    revenue: "$9,840",
    status: "Active",
  },
];

export function ReportsCampaignTable() {
  return (
    <Card
      size="3"
      variant="surface"
      className="bg-card/95 text-card-foreground backdrop-blur-xl border border-border rounded-3xl p-5 lg:p-6 shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] hover:bg-card transition-all duration-200 hover:scale-[1.01] flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Campaign Performance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            High-level stats for your key campaigns.
          </p>
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card/95">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400 bg-white/5">
                <th className="px-4 py-3 text-left font-medium">Campaign</th>
                <th className="px-4 py-3 text-right font-medium">Clicks</th>
                <th className="px-4 py-3 text-right font-medium">Unique Visitors</th>
                <th className="px-4 py-3 text-right font-medium">Conversion Rate</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                <th className="px-4 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((campaign, index) => (
                <tr
                  key={campaign.name}
                  className={`border-t border-white/5 ${
                    index % 2 === 0 ? "bg-slate-950/20" : "bg-slate-950/10"
                  } hover:bg-white/10 transition-colors duration-150`}
                >
                  <td className="px-4 py-3 text-left text-slate-100 font-medium">
                    {campaign.name}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-100">
                    {campaign.clicks}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-100">
                    {campaign.visitors}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-300">
                    {campaign.conversionRate}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-100">
                    {campaign.revenue}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center justify-end gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        campaign.status === "Active"
                          ? "bg-emerald-500/10 border border-emerald-400/40 text-emerald-300"
                          : "bg-slate-500/10 border border-slate-400/40 text-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          campaign.status === "Active" ? "bg-emerald-400" : "bg-slate-300"
                        }`}
                      />
                      {campaign.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
