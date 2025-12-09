import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ children, className }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl text-card-foreground",
        "bg-white dark:bg-[#121212]",
        "shadow-md dark:shadow-lg",
        "transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-xl",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function DashboardCardHeader({ children, className }: CardProps) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-3 px-4 pt-3 pb-1",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function DashboardCardBody({ children, className }: CardProps) {
  return (
    <div
      className={[
        "px-4 pb-4 pt-1 text-sm text-card-foreground",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
