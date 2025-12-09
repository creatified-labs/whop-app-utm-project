import React from "react";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 min-h-screen transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10 space-y-6 lg:space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
