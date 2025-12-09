import React from "react";
import { Badge, Button } from "@whop/react/components";
import { DashboardCard } from "@/components/ui/DashboardCard";

export function RecentLinksTable() {
  const links = [
    { id: 1, name: "Main Landing Page", source: "instagram / social", campaign: "launch_q1", clicks: "1,203", created: "2 hours ago" },
    { id: 2, name: "Email Welcome Flow", source: "email / flow", campaign: "welcome_series", clicks: "842", created: "5 hours ago" },
    { id: 3, name: "Twitter Bio Link", source: "twitter / profile", campaign: "bio_optin", clicks: "650", created: "1 day ago" },
    { id: 4, name: "YouTube Demo Video", source: "youtube / video", campaign: "demo_v2", clicks: "324", created: "2 days ago" },
    { id: 5, name: "Blog Post: SEO Guide", source: "blog / organic", campaign: "seo_mastery", clicks: "112", created: "3 days ago" },
  ];

  return (
    <DashboardCard className="p-6 lg:p-7 h-full overflow-hidden relative group">
      {/* Subtle Glow Effect */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-semibold text-neutral-100 tracking-tight">Recent Links</h3>
          <p className="text-sm text-neutral-400">Latest generated UTMs</p>
        </div>
        <Button size="2" variant="ghost" color="blue" className="text-xs font-semibold">
          View All Links
        </Button>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase text-slate-500 tracking-wider font-semibold">
              <th className="pb-4 pl-2">Link Name</th>
              <th className="pb-4">Source / Medium</th>
              <th className="pb-4">Campaign</th>
              <th className="pb-4 text-right">Clicks</th>
              <th className="pb-4 text-right">Created</th>
              <th className="pb-4 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr
                key={link.id}
                className="group/row hover:bg-white/5 transition-colors border-b border-white/5 last:border-none"
              >
                <td className="py-5 pl-2 font-semibold text-neutral-100 group-hover/row:text-white transition-colors">
                  {link.name}
                </td>
                <td className="py-5">
                  <Badge color="gray" variant="surface" className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/5 bg-white/5">
                    {link.source}
                  </Badge>
                </td>
                <td className="py-5 text-neutral-400">{link.campaign}</td>
                <td className="py-5 text-right text-neutral-100 font-mono tabular-nums">
                  {link.clicks}
                </td>
                <td className="py-5 text-right text-neutral-500 text-xs">
                  {link.created}
                </td>
                <td className="py-5 text-right pr-2">
                  <Button
                    size="1"
                    variant="ghost"
                    color="indigo"
                    className="text-xs opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 transform translate-x-2 group-hover/row:translate-x-0"
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
