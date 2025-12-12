"use client";

import React, { useState } from "react";
import { Badge } from "@whop/react/components";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
} from "@/components/ui/DashboardCard";

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold tracking-tight text-foreground">
          Analytics Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Campaign performance and insights across all tracking links
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value="47,329"
          trend="+15.3%"
          trendLabel="from last month"
          trendUp
        />
        <MetricCard
          label="Revenue"
          value="$284K"
          trend="+22.8%"
          trendLabel="from last month"
          trendUp
        />
        <MetricCard
          label="Active Rate"
          value="92%"
          trend="↑ +3.2%"
          trendLabel="vs last week"
          trendUp
        />
        <MetricCard
          label="Avg Rating"
          value="4.2"
          trend="⭐ Excellent"
          trendLabel="user feedback"
        />
      </div>

      {/* Main Chart */}
      <CampaignPerformanceChart />

      {/* Bottom Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SmallStatCard label="New Signups" value="3.2K" color="blue" />
        <SmallStatCard label="Retention" value="68%" color="purple" />
        <SmallStatCard label="Engagement" value="+8.7%" color="emerald" />
        <SmallStatCard label="Avg Session" value="3m 24s" color="cyan" />
      </div>

      {/* Campaigns and Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <CampaignsList />
        </div>
        <div className="lg:col-span-8">
          <PerformanceMetrics />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  trendUp,
}: {
  label: string;
  value: string;
  trend: string;
  trendLabel: string;
  trendUp?: boolean;
}) {
  return (
    <DashboardCard className="p-5">
      <div className="space-y-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            color={trendUp ? "green" : "gray"}
            variant="soft"
            className="text-[11px] px-2 py-0.5 font-semibold rounded-md"
          >
            {trend}
          </Badge>
          <span className="text-xs text-muted-foreground">{trendLabel}</span>
        </div>
      </div>
    </DashboardCard>
  );
}

function CampaignPerformanceChart() {
  const [activeRange, setActiveRange] = useState<"7d" | "30d" | "90d">("30d");

  const data = {
    "7d": [45, 62, 78, 95, 88, 71, 54],
    "30d": [45, 62, 78, 95, 88, 71, 54, 60, 75, 82, 90, 85],
    "90d": [30, 45, 55, 70, 65, 80, 88, 85, 92, 87, 95, 90, 85, 82],
  };

  const chartData = data[activeRange];
  const max = Math.max(...chartData);

  return (
    <DashboardCard className="p-6">
      <DashboardCardHeader>
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            Campaign Performance
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Weekly trend</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeRange === range
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </DashboardCardHeader>

      <DashboardCardBody className="mt-4">
        <div className="relative h-48 sm:h-56">
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-1 sm:gap-2 h-full">
            {chartData.map((height, idx) => (
              <div key={idx} className="flex-1 flex items-end group">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                  style={{ height: `${(height / max) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-4 text-[10px] text-muted-foreground font-medium">
          {activeRange === "7d" && (
            <>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </>
          )}
          {activeRange === "30d" && (
            <>
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </>
          )}
          {activeRange === "90d" && (
            <>
              <span>Month 1</span>
              <span>Month 2</span>
              <span>Month 3</span>
            </>
          )}
        </div>
      </DashboardCardBody>
    </DashboardCard>
  );
}

function SmallStatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "blue" | "purple" | "emerald" | "cyan";
}) {
  const colorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
  };

  return (
    <DashboardCard className="p-4 text-center">
      <div className={`text-xl font-semibold ${colorClasses[color]}`}>
        {value}
      </div>
      <div className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wide">
        {label}
      </div>
    </DashboardCard>
  );
}

function CampaignsList() {
  const campaigns = [
    {
      name: "Summer Launch 2025",
      status: "active" as const,
      progress: 89,
      color: "blue",
    },
    {
      name: "Product Features",
      status: "active" as const,
      progress: 62,
      color: "cyan",
    },
    {
      name: "Security Update",
      status: "active" as const,
      progress: 95,
      color: "blue",
    },
    {
      name: "Pricing Changes",
      status: "active" as const,
      progress: 78,
      color: "purple",
    },
    {
      name: "Mobile App Beta",
      status: "paused" as const,
      progress: 0,
      color: "gray",
    },
  ];

  return (
    <DashboardCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Active Campaigns
        </h3>
        <Badge variant="soft" color="gray" className="text-[10px] px-2 py-0.5">
          {campaigns.filter((c) => c.status === "active").length} active
        </Badge>
      </div>

      <div className="space-y-3">
        {campaigns.map((campaign, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${
              campaign.status === "active"
                ? "bg-accent/40 hover:bg-accent/60"
                : "opacity-60 hover:bg-accent/20"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {campaign.name}
              </p>
              {campaign.status === "active" && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {campaign.progress}% complete
                </p>
              )}
              {campaign.status === "paused" && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Paused
                </p>
              )}
            </div>
            {campaign.status === "active" && (
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center">
                  <span className="text-xs font-semibold text-foreground">
                    {campaign.progress}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function PerformanceMetrics() {
  const metrics = [
    { label: "Conversion Rate", value: "+12.3%", color: "bg-blue-500" },
    { label: "Page Views", value: "847K", color: "bg-blue-500" },
    { label: "Engagement", value: "+8.7%", color: "bg-purple-500" },
    { label: "Click Rate", value: "4.2%", color: "bg-cyan-600" },
    { label: "Avg Session", value: "3m 24s", color: "bg-orange-600" },
  ];

  return (
    <DashboardCard className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Performance Metrics
        </h3>
        <button className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          View Details →
        </button>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-2 rounded-sm ${metric.color}`} />
                <span className="font-medium text-foreground">
                  {metric.label}
                </span>
              </div>
              <span className="font-semibold text-foreground tabular-nums">
                {metric.value}
              </span>
            </div>
            <div className="h-2 rounded-full bg-accent overflow-hidden">
              <div
                className={`h-full rounded-full ${metric.color}`}
                style={{
                  width: `${Math.min(
                    90,
                    Math.max(
                      20,
                      parseInt(metric.value.replace(/[^\d]/g, "")) || 50
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">$18.9K</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              MRR
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">$302K</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Total Revenue
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">10.4%</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Conversion
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
