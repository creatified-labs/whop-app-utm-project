import type { ReactNode } from "react";

interface DashboardTopBarProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}

export function DashboardTopBar({
  title,
  subtitle,
  rightSlot,
}: DashboardTopBarProps) {
  return (
    // Added 'pt-24' (padding-top) to account for the space the fixed Navbar takes up
    <div className="mb-6 flex flex-col gap-4 pt-24 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-black dark:text-neutral-50">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-xs text-neutral-400 max-w-2xl">
            {subtitle}
          </p>
        ) : null}
      </div>

      {rightSlot ? (
        <div className="flex items-center gap-2 sm:gap-3 justify-end">
          {rightSlot}
        </div>
      ) : null}
    </div>
  );
}
