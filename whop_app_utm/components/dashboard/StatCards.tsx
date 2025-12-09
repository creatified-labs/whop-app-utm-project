import React from "react";
import { Badge } from "@whop/react/components";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
} from "@/components/ui/DashboardCard";

export function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 md:mb-10">
      <StatCard
        label="Total Clicks"
        value="12,453"
        trend="+12.4%"
        trendUp
        icon={<MousePointerClickIcon />}
      />
      <StatCard
        label="Unique Visitors"
        value="8,203"
        trend="+5.2%"
        trendUp
        icon={<UsersIcon />}
      />
      <StatCard
        label="Active Links"
        value="142"
        trend="+2"
        trendUp
        icon={<Link2Icon />}
      />
      <StatCard
        label="Top Campaign"
        value="Launch_2025"
        subValue="2.4k clicks"
        trend="Best Performer"
        icon={<TrophyIcon />}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
  trend,
  trendUp,
  icon,
}: {
  label: string;
  value: string;
  subValue?: string;
  trend: string;
  trendUp?: boolean;
  icon: React.ReactNode;
}) {
  const badgeConfig = (() => {
    if (trendUp) {
      return { color: "green" as const, variant: "soft" as const };
    }
    if (trend === "Best Performer") {
      return { color: "purple" as const, variant: "soft" as const };
    }
    return { color: "gray" as const, variant: "surface" as const };
  })();

  return (
    <div className="group h-full">
      <DashboardCard className="p-5 h-full flex flex-col justify-between">
        <DashboardCardHeader>
          <span className="text-xs text-neutral-400 font-medium tracking-wide">
            {label}
          </span>
          <div className="p-2 rounded-xl bg-neutral-900/80 ring-1 ring-white/10 text-neutral-400 group-hover:text-neutral-100 transition-colors duration-200">
            {icon}
          </div>
        </DashboardCardHeader>

        <DashboardCardBody className="mt-4">
          <div
            className={`font-bold text-neutral-100 tracking-tight mb-1 ${
              value.length > 10 ? "text-2xl" : "text-3xl"
            }`}
          >
            {value}
          </div>
          {subValue && (
            <div className="text-sm text-emerald-300 mb-2 font-medium">
              {subValue}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <Badge
              {...badgeConfig}
              className="text-[11px] px-2 py-0.5 font-semibold rounded-md"
            >
              {trend}
            </Badge>
            {trendUp && (
              <span className="text-xs text-neutral-500 font-medium">
                vs last week
              </span>
            )}
          </div>
        </DashboardCardBody>
      </DashboardCard>
    </div>
  );
}

function MousePointerClickIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function Link2Icon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
