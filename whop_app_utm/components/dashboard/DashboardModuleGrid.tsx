"use client";

import React, { useRef, useState } from "react";
import { Badge } from "@whop/react/components";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardBody,
} from "@/components/ui/DashboardCard";

type WidgetId =
  | "totalClicks"
  | "uniqueVisitors"
  | "activeLinks"
  | "topCampaignMetric"
  | "topCampaignDetails"
  | "retargeting"
  | "emailFlow";

interface WidgetState {
  id: WidgetId;
  height: number;
}

const INITIAL_WIDGETS: WidgetState[] = [
  { id: "totalClicks", height: 220 },
  { id: "uniqueVisitors", height: 220 },
  { id: "activeLinks", height: 220 },
  { id: "topCampaignMetric", height: 220 },
  { id: "topCampaignDetails", height: 220 },
  { id: "retargeting", height: 220 },
  { id: "emailFlow", height: 220 },
];

export function DashboardModuleGrid() {
  const [widgets, setWidgets] = useState<WidgetState[]>(INITIAL_WIDGETS);
  const draggingIdRef = useRef<WidgetId | null>(null);
  const resizeStateRef = useRef<{
    id: WidgetId;
    startY: number;
    startHeight: number;
  } | null>(null);

  const handleDragStart = (id: WidgetId, event: React.DragEvent<HTMLDivElement>) => {
    draggingIdRef.current = id;
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (id: WidgetId, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const fromId = draggingIdRef.current;
    if (!fromId || fromId === id) return;

    setWidgets((prev) => {
      const fromIndex = prev.findIndex((w) => w.id === fromId);
      const toIndex = prev.findIndex((w) => w.id === id);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    draggingIdRef.current = null;
  };

  const handleResizeMouseDown = (id: WidgetId, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const widget = widgets.find((w) => w.id === id);
    if (!widget) return;

    resizeStateRef.current = {
      id,
      startY: event.clientY,
      startHeight: widget.height,
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
  };

  const handleWindowMouseMove = (event: MouseEvent) => {
    const state = resizeStateRef.current;
    if (!state) return;

    const deltaY = event.clientY - state.startY;
    const nextHeight = Math.min(480, Math.max(180, state.startHeight + deltaY));

    setWidgets((prev) =>
      prev.map((w) => (w.id === state.id ? { ...w, height: nextHeight } : w)),
    );
  };

  const handleWindowMouseUp = () => {
    resizeStateRef.current = null;
    window.removeEventListener("mousemove", handleWindowMouseMove);
    window.removeEventListener("mouseup", handleWindowMouseUp);
  };

  return (
    <div className="flex flex-wrap gap-5">
      {widgets.map((widget) => (
        <div
          key={widget.id}
          className="relative flex-none w-full md:basis-1/2 xl:basis-1/3"
          style={{ minHeight: widget.height }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(widget.id, event)}
        >
          {/* Drag handle tab at top center (inside card) */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full bg-white/25 cursor-grab active:cursor-grabbing z-10"
            draggable
            onDragStart={(event) => handleDragStart(widget.id, event)}
            onDragEnd={() => {
              draggingIdRef.current = null;
            }}
          />

          <DashboardCard className="p-5 h-full relative overflow-hidden">
            {renderWidgetHeader(widget.id)}
            {renderWidgetBody(widget.id)}

            {/* Resize handle bottom-right */}
            <div
              className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-md border border-white/40 bg-white/10 cursor-nwse-resize"
              onMouseDown={(event) => handleResizeMouseDown(widget.id, event)}
            />
          </DashboardCard>
        </div>
      ))}
    </div>
  );
}

function renderWidgetHeader(id: WidgetId) {
  switch (id) {
    case "totalClicks":
      return (
        <DashboardCardHeader>
          <span className="text-xs text-neutral-400 font-medium tracking-wide">
            Total Clicks
          </span>
          <div className="p-2 rounded-xl bg-neutral-900/80 ring-1 ring-white/10 text-neutral-400">
            <MousePointerClickIcon />
          </div>
        </DashboardCardHeader>
      );
    case "uniqueVisitors":
      return (
        <DashboardCardHeader>
          <span className="text-xs text-neutral-400 font-medium tracking-wide">
            Unique Visitors
          </span>
          <div className="p-2 rounded-xl bg-neutral-900/80 ring-1 ring-white/10 text-neutral-400">
            <UsersIcon />
          </div>
        </DashboardCardHeader>
      );
    case "activeLinks":
      return (
        <DashboardCardHeader>
          <span className="text-xs text-neutral-400 font-medium tracking-wide">
            Active Links
          </span>
          <div className="p-2 rounded-xl bg-neutral-900/80 ring-1 ring-white/10 text-neutral-400">
            <Link2Icon />
          </div>
        </DashboardCardHeader>
      );
    case "topCampaignMetric":
      return (
        <DashboardCardHeader>
          <span className="text-xs text-neutral-400 font-medium tracking-wide">
            Top Campaign
          </span>
          <div className="p-2 rounded-xl bg-neutral-900/80 ring-1 ring-white/10 text-neutral-400">
            <TrophyIcon />
          </div>
        </DashboardCardHeader>
      );
    case "topCampaignDetails":
      return (
        <DashboardCardHeader>
          <div>
            <h3 className="text-lg tracking-tight font-semibold text-neutral-100">
              Top Campaign
            </h3>
            <p className="text-xs text-neutral-400">launch_2025</p>
          </div>
          <CardMoreButton />
        </DashboardCardHeader>
      );
    case "retargeting":
      return (
        <DashboardCardHeader>
          <div>
            <h3 className="text-lg tracking-tight font-semibold text-neutral-100">
              Retargeting Performance
            </h3>
            <p className="text-xs text-neutral-400">social_retarg_q1</p>
          </div>
          <CardMoreButton />
        </DashboardCardHeader>
      );
    case "emailFlow":
      return (
        <DashboardCardHeader>
          <div>
            <h3 className="text-lg tracking-tight font-semibold text-neutral-100">
              Email Welcome Flow
            </h3>
            <p className="text-xs text-neutral-400">welcome_series</p>
          </div>
          <CardMoreButton />
        </DashboardCardHeader>
      );
    default:
      return null;
  }
}

function renderWidgetBody(id: WidgetId) {
  switch (id) {
    case "totalClicks":
      return (
        <DashboardCardBody className="mt-4">
          <div className="font-bold text-neutral-100 tracking-tight mb-1 text-3xl">
            12,453
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              color="green"
              variant="soft"
              className="text-[11px] px-2 py-0.5 font-semibold rounded-md"
            >
              +12.4%
            </Badge>
            <span className="text-xs text-neutral-500 font-medium">
              vs last week
            </span>
          </div>
        </DashboardCardBody>
      );
    case "uniqueVisitors":
      return (
        <DashboardCardBody className="mt-4">
          <div className="font-bold text-neutral-100 tracking-tight mb-1 text-3xl">
            8,203
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              color="green"
              variant="soft"
              className="text-[11px] px-2 py-0.5 font-semibold rounded-md"
            >
              +5.2%
            </Badge>
            <span className="text-xs text-neutral-500 font-medium">
              vs last week
            </span>
          </div>
        </DashboardCardBody>
      );
    case "activeLinks":
      return (
        <DashboardCardBody className="mt-4">
          <div className="font-bold text-neutral-100 tracking-tight mb-1 text-3xl">
            142
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              color="green"
              variant="soft"
              className="text-[11px] px-2 py-0.5 font-semibold rounded-md"
            >
              +2
            </Badge>
            <span className="text-xs text-neutral-500 font-medium">
              vs last week
            </span>
          </div>
        </DashboardCardBody>
      );
    case "topCampaignMetric":
      return (
        <DashboardCardBody className="mt-4">
          <div className="font-bold text-neutral-100 tracking-tight mb-1 text-2xl">
            Launch_2025
          </div>
          <div className="text-sm text-emerald-300 mb-2 font-medium">
            2.4k clicks
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              color="purple"
              variant="soft"
              className="text-[11px] px-2 py-0.5 font-semibold rounded-md"
            >
              Best Performer
            </Badge>
          </div>
        </DashboardCardBody>
      );
    case "topCampaignDetails":
      return (
        <DashboardCardBody>
          <p className="text-sm text-neutral-300 mb-4">
            Best-performing UTM campaign this period.
          </p>
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-300">Completion</span>
              <span className="text-neutral-400">76%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 ring-1 ring-white/5">
              <div className="h-2 w-[76%] rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
            </div>
          </div>
        </DashboardCardBody>
      );
    case "retargeting":
      return (
        <DashboardCardBody>
          <p className="text-sm text-neutral-300 mb-4">
            Click-through rate across paid social retargeting.
          </p>
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-300">CTR</span>
              <span className="text-neutral-400">3.8%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 ring-1 ring-white/5">
              <div className="h-2 w-[38%] rounded-full bg-gradient-to-r from-sky-400 to-indigo-400" />
            </div>
          </div>
        </DashboardCardBody>
      );
    case "emailFlow":
      return (
        <DashboardCardBody>
          <p className="text-sm text-neutral-300 mb-4">
            Performance of your core email welcome automation.
          </p>
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-neutral-300">Conversions</span>
              <span className="text-neutral-400">61%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 ring-1 ring-white/5">
              <div className="h-2 w-[61%] rounded-full bg-gradient-to-r from-amber-400 to-rose-400" />
            </div>
          </div>
        </DashboardCardBody>
      );
    default:
      return null;
  }
}

function CardMoreButton() {
  return (
    <button className="p-1.5 rounded-lg hover:bg-neutral-800/70 text-neutral-400">
      <span className="sr-only">More</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    </button>
  );
}

function MousePointerClickIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function Link2Icon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
