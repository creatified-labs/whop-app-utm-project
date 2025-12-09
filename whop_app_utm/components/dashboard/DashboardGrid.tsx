"use client";

import React, { useEffect, useState } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Badge } from "@whop/react/components";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
} from "@/components/ui/DashboardCard";
import { useParams } from "next/navigation";

const initialLayout: Layout[] = [
  { i: "totalStats", x: 0, y: 0, w: 4, h: 4 },
  { i: "mrr", x: 4, y: 0, w: 2, h: 4 },
  { i: "metric", x: 6, y: 0, w: 2, h: 4 },
  { i: "revenue", x: 8, y: 0, w: 4, h: 4 },
  { i: "sources", x: 0, y: 4, w: 6, h: 4 },
  { i: "attribution", x: 6, y: 4, w: 6, h: 4 },
];

export function DashboardGrid() {
  const params = useParams() as { companyId?: string };
  const companyId = params.companyId ?? "default";
  const storageKey = `utm-dashboard-layout:${companyId}`;

  const [layout, setLayout] = useState<Layout[]>(initialLayout);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return;

      const isValid = parsed.every((item: any) => {
        return (
          item &&
          typeof item.i === "string" &&
          typeof item.x === "number" &&
          typeof item.y === "number" &&
          typeof item.w === "number" &&
          typeof item.h === "number"
        );
      });

      if (isValid) {
        setLayout(parsed as Layout[]);
      }
    } catch {
      // ignore invalid stored layout
    }
  }, [storageKey]);

  const handleLayoutChange = (next: Layout[]) => {
    setLayout(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
    }
  };

  return (
    <div className="min-h-[600px] text-neutral-100">
      <div className="px-4 sm:px-6 lg:px-8 pb-10 pt-4">
        <button
          type="button"
          className="mb-3 ml-auto block text-xs text-neutral-400 hover:text-neutral-100"
          onClick={() => {
            setLayout(initialLayout);
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(storageKey);
            }
          }}
        >
          Reset layout
        </button>

        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={40}
          margin={[16, 16]}
          // TODO: measure container width instead of hardcoding
          width={1200}
          isDraggable
          isResizable
          draggableHandle=".widget-drag-handle"
          onLayoutChange={handleLayoutChange}
        >
          <div key="totalStats" className="h-full">
            <WidgetChrome>
              <TotalStatsWidget />
            </WidgetChrome>
          </div>

          <div key="mrr" className="h-full">
            <WidgetChrome>
              <MrrWidget />
            </WidgetChrome>
          </div>

          <div key="metric" className="h-full">
            <WidgetChrome>
              <MetricWidget />
            </WidgetChrome>
          </div>

          <div key="revenue" className="h-full">
            <WidgetChrome>
              <RevenueWidget />
            </WidgetChrome>
          </div>

          <div key="sources" className="h-full">
            <WidgetChrome>
              <TopSourcesWidget />
            </WidgetChrome>
          </div>

          <div key="attribution" className="h-full">
            <WidgetChrome>
              <AttributionWidget />
            </WidgetChrome>
          </div>
        </GridLayout>
      </div>
    </div>
  );
}

function WidgetChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full">
      {/* Drag handle tab at top center */}
      <div className="widget-drag-handle absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-neutral-300/70 cursor-grab active:cursor-grabbing z-10" />

      <DashboardCard className="pt-5 pb-4 px-4 h-full flex flex-col justify-between relative overflow-hidden">
        {children}
      </DashboardCard>
    </div>
  );
}

function TotalStatsWidget() {
  return (
    <>
      <DashboardCardHeader>
        <div>
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
            Total Stats
          </span>
          <p className="text-[11px] text-neutral-400 mt-0.5">Last 30 days</p>
        </div>
      </DashboardCardHeader>

      <DashboardCardBody className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Total tracked revenue
          </p>
          <p className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            $123,456
          </p>
          <p className="text-xs text-emerald-600 mt-1">+18.4% vs last period</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-neutral-600 mt-auto">
          <div className="space-y-1">
            <p className="flex items-center justify-between">
              <span>ROAS</span>
              <span className="font-medium text-neutral-900">4.2x</span>
            </p>
            <p className="flex items-center justify-between">
              <span>Cost</span>
              <span className="font-medium text-neutral-900">$28,340</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="flex items-center justify-between">
              <span>Customers</span>
              <span className="font-medium text-neutral-900">1,284</span>
            </p>
            <p className="flex items-center justify-between">
              <span>Cost / sale</span>
              <span className="font-medium text-neutral-900">$22.08</span>
            </p>
          </div>
        </div>
      </DashboardCardBody>
    </>
  );
}

function MrrWidget() {
  return (
    <>
      <DashboardCardHeader>
        <div>
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
            MRR
          </span>
          <p className="text-[11px] text-neutral-400 mt-0.5">Recurring revenue</p>
        </div>
      </DashboardCardHeader>

      <DashboardCardBody className="mt-4 flex flex-col justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Monthly recurring revenue
          </p>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            $18,920
          </p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            +6.3% vs last month
          </p>
        </div>
        <div className="flex items-end gap-1 h-20">
          {[30, 45, 55, 50, 60, 72, 80, 78, 82, 90].map((h, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-full bg-neutral-100 overflow-hidden"
            >
              <div
                className="w-full rounded-full bg-emerald-500"
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
      </DashboardCardBody>
    </>
  );
}

function MetricWidget() {
  return (
    <>
      <DashboardCardHeader>
        <div>
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
            Metric
          </span>
          <p className="text-[11px] text-neutral-400 mt-0.5">Funnel conversion</p>
        </div>
      </DashboardCardHeader>

      <DashboardCardBody className="mt-4 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Funnel conversion rate
          </p>
          <p className="text-3xl font-semibold tracking-tight text-neutral-900">
            10.4%
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            From landing page view to purchase.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-neutral-600">
          <div>
            <p className="font-medium text-neutral-900">3,210</p>
            <p>Sessions</p>
          </div>
          <div>
            <p className="font-medium text-neutral-900">334</p>
            <p>Purchases</p>
          </div>
        </div>
      </DashboardCardBody>
    </>
  );
}

function RevenueWidget() {
  return (
    <>
      <DashboardCardHeader>
        <div>
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
            Total Revenue
          </span>
          <p className="text-[11px] text-neutral-400 mt-0.5">Attributed</p>
        </div>
      </DashboardCardHeader>

      <DashboardCardBody className="mt-4 flex flex-col justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
            Total revenue
          </p>
          <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            $302,410
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Cost: <span className="font-medium text-neutral-900">$84,120</span>
          </p>
        </div>
        <div className="mt-2 h-20 rounded-xl bg-neutral-100 relative overflow-hidden">
          <div className="absolute inset-x-2 bottom-3 h-10 flex items-end gap-1">
            {[20, 35, 30, 45, 40, 55, 60, 58, 70, 68, 80, 78].map((h, idx) => (
              <div key={idx} className="flex-1 flex items-end">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-neutral-900 to-neutral-500/30"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </DashboardCardBody>
    </>
  );
}

function TopSourcesWidget() {
  return (
    <>
      <DashboardCardHeader>
        <div>
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
            Top Sources
          </span>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            By attributed revenue
          </p>
        </div>
      </DashboardCardHeader>

      <DashboardCardBody className="mt-4 flex flex-col">
        <div className="space-y-2 text-xs text-neutral-600">
          {["facebook / paid", "google / cpc", "email / flows"].map(
            (label, idx) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200/60 bg-neutral-50 px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-neutral-900">{label}</span>
                  <span className="text-[11px] text-neutral-500">
                    {idx === 0
                      ? "$82,430 revenue"
                      : idx === 1
                      ? "$54,210 revenue"
                      : "$32,890 revenue"}
                  </span>
                </div>
                <span className="text-xs font-semibold text-neutral-900">
                  {idx === 0 ? "42%" : idx === 1 ? "29%" : "18%"}
                </span>
              </div>
            ),
          )}
        </div>
      </DashboardCardBody>
    </>
  );
}

function AttributionWidget() {
  return (
    <>
      <DashboardCardHeader>
        <div>
          <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
            Attribution Gap
          </span>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Tracked vs untracked
          </p>
        </div>
      </DashboardCardHeader>

      <DashboardCardBody className="mt-4 flex flex-col justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-neutral-200" />
            <div className="absolute inset-1.5 rounded-full border-4 border-emerald-500 border-t-transparent border-l-transparent rotate-[-45deg]" />
            <div className="absolute inset-5 rounded-full bg-white flex items-center justify-center">
              <span className="text-sm font-semibold text-neutral-900">
                78%
              </span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-neutral-600">
            <p className="font-medium text-neutral-900">78% attributed</p>
            <p>Of tracked revenue has a clear UTM source.</p>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-neutral-600">
          <div>
            <p className="font-medium text-neutral-900">$236,000</p>
            <p>Attributed</p>
          </div>
          <div>
            <p className="font-medium text-neutral-900">$66,410</p>
            <p>Unattributed</p>
          </div>
        </div>
      </DashboardCardBody>
    </>
  );
}
