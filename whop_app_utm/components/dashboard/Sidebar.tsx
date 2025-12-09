"use client";

import React from 'react';
import { Button } from "@whop/react/components";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

type NavItemKey = "overview" | "links" | "presets" | "reports" | "settings";

export function Sidebar() {
  const params = useParams() as { companyId?: string };
  const companyId = params.companyId ?? "company";
  const pathname = usePathname();

  const base = `/dashboard/${companyId}`;

  const items: { key: NavItemKey; label: string; href: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", href: base, icon: <LayoutGridIcon /> },
    { key: "links", label: "Links", href: `${base}/links`, icon: <LinkIcon /> },
    { key: "presets", label: "Presets", href: `${base}/presets`, icon: <LayersIcon /> },
    { key: "reports", label: "Reports", href: `${base}/reports`, icon: <BarChartIcon /> },
    { key: "settings", label: "Settings", href: `${base}/settings`, icon: <SettingsIcon /> },
  ];

  const isActive = (item: (typeof items)[number]) => {
    if (item.key === "overview") {
      return pathname === base;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-full fixed left-0 top-0 z-50 border-r border-white/5 bg-white/5 backdrop-blur-2xl shadow-2xl">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
            UTM
          </div>
          <span className="font-bold text-slate-100 tracking-tight text-lg">UTM Builder + Tracker</span>
        </div>

        <nav className="flex-1 px-6 py-2 flex flex-col gap-2">
          {items.map((item) => (
            <Link key={item.key} href={item.href} className="block">
              <NavItem
                label={item.label}
                active={isActive(item)}
                icon={item.icon}
              />
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <p className="text-sm text-white font-semibold mb-1 relative z-10">Pro Plan</p>
            <p className="text-xs text-slate-400 mb-3 relative z-10">Unlock unlimited links & analytics.</p>
            <Button
              size="2"
              variant="classic"
              color="indigo"
              className="w-full text-xs font-semibold shadow-lg shadow-indigo-500/20 relative z-10"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Topbar (small screens) */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-indigo-500/20">
            UTM
          </div>
          <span className="font-bold text-slate-100 text-lg">UTM Builder + Tracker</span>
        </div>
        <button className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <MenuIcon />
        </button>
      </div>
    </>
  );
}

function NavItem({ label, active, icon }: { label: string; active?: boolean; icon: React.ReactNode }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative overflow-hidden ${
        active
          ? 'bg-white/10 text-white shadow-inner border-l-4 border-white/40'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`transition-colors duration-200 ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </div>
  );
}

// Premium Icons
function LayoutGridIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 012 2h2a2 2 0 012-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
