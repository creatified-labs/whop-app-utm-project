"use client";

import type { FC } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface DashboardAccountPillProps {
  accountName: string;
  avatarInitials: string;
  avatarUrl: string | null;
  settingsHref: string;
}

export const DashboardAccountPill: FC<DashboardAccountPillProps> = ({
  accountName,
  avatarInitials,
  avatarUrl,
  settingsHref,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-auto mb-3 relative inline-flex flex-col items-start">
      <button
        type="button"
        onClick={() => setIsOpen((open: boolean) => !open)}
        className="inline-flex items-center gap-2 rounded-full bg-black/40 border border-border px-2.5 py-1.5 text-xs text-card-foreground backdrop-blur-2xl shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)]"
      >
        {avatarUrl ? (
          <span className="h-8 w-8 rounded-full overflow-hidden bg-neutral-900/5 dark:bg-white/15 flex items-center justify-center">
            <Image
              src={avatarUrl}
              alt={accountName}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </span>
        ) : (
          <span className="h-8 w-8 rounded-full bg-neutral-900/5 dark:bg-white/15 text-[11px] flex items-center justify-center text-neutral-900 dark:text-neutral-50">
            {avatarInitials}
          </span>
        )}
        <span className="flex items-center gap-1 text-left leading-tight">
          <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {accountName}
          </span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-52 rounded-2xl border border-neutral-200/80 dark:border-white/15 bg-white/95 dark:bg-black/90 text-xs text-neutral-800 dark:text-neutral-100 shadow-[0_18px_45px_rgba(0,0,0,0.85)] overflow-hidden">
          <Link
            href={settingsHref}
            className="block px-3 py-2.5 text-[12px] hover:bg-neutral-50 dark:hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            Workspace settings
          </Link>
          <button
            type="button"
            className="block w-full px-3 py-2.5 text-left text-[12px] text-neutral-500 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-white/10"
            onClick={() => setIsOpen(false)}
          >
            Manage billing (coming soon)
          </button>
        </div>
      )}
    </div>
  );
};
