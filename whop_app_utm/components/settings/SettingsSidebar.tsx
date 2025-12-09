"use client";

import React, { useEffect, useState } from "react";

type SettingsSectionKey = "general" | "tracking" | "integrations" | "team" | "billing";

const SECTIONS: { label: string; href: string; key: SettingsSectionKey }[] = [
  { label: "General", href: "#general", key: "general" },
  { label: "Tracking Defaults", href: "#tracking", key: "tracking" },
  { label: "Integrations", href: "#integrations", key: "integrations" },
  { label: "Team", href: "#team", key: "team" },
  { label: "Billing", href: "#billing", key: "billing" },
];

export function SettingsSidebar() {
  const [activeKey, setActiveKey] = useState<SettingsSectionKey>("general");

  // Scrollspy: update activeKey based on which section is in view
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return;
    }

    const sectionIds = SECTIONS.map((s) => s.href.replace("#", ""));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        // Pick the section with the largest intersection ratio
        visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const topId = visible[0]?.target.id as SettingsSectionKey | undefined;
        if (topId && topId !== activeKey) {
          setActiveKey(topId);
        }
      },
      {
        root: null,
        // Focus on the middle of the viewport so the highlight feels natural
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [activeKey]);

  return (
    <div className="space-y-3">
      {/* Mobile segmented control */}
      <div className="flex md:hidden overflow-x-auto -mx-1 pb-1">
        <div className="flex gap-2 px-1">
          {SECTIONS.map((section) => {
            const isActive = activeKey === section.key;
            return (
              <a
                key={section.label}
                href={section.href}
                onClick={(event) => {
                  event.preventDefault();
                  const el = document.getElementById(section.key);
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    const offset = 120; // keep section a bit below the top so menu feels side-by-side
                    const targetY = window.scrollY + rect.top - offset;
                    window.scrollTo({ top: targetY, behavior: "smooth" });
                  }
                  setActiveKey(section.key);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                  isActive
                    ? "bg-white/15 border-white/40 text-white shadow-sm"
                    : "bg-white/0 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {section.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Desktop frosted sidebar */}
      <aside className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 lg:p-5 shadow-xl">
        <nav className="space-y-1">
          {SECTIONS.map((section) => {
            const isActive = activeKey === section.key;
            return (
              <a
                key={section.label}
                href={section.href}
                onClick={(event) => {
                  event.preventDefault();
                  const el = document.getElementById(section.key);
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    const offset = 120;
                    const targetY = window.scrollY + rect.top - offset;
                    window.scrollTo({ top: targetY, behavior: "smooth" });
                  }
                  setActiveKey(section.key);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? "bg-white/10 text-white shadow-inner border-l-4 border-white/40 pl-2.5"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-xs text-slate-500">●</span>
                <span>{section.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
