import React from "react";
import { SettingsSidebar } from "./SettingsSidebar";

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      <div className="lg:w-64 lg:flex-shrink-0">
        <SettingsSidebar />
      </div>
      <div className="flex-1 space-y-6">
        {children}
      </div>
    </div>
  );
}
