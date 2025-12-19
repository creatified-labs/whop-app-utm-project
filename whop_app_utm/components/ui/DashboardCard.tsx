import React, { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
}

export function DashboardCard({ children, className }: CardProps) {
	return (
		<div
			className={[
				"rounded-2xl text-card-foreground",
				"bg-white/5 dark:bg-black/5",
				"backdrop-blur-xl",
				"border border-white/10 dark:border-white/5",
				"shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]",
				"transition-all duration-200",
				"hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] hover:-translate-y-0.5",
				"overflow-visible",
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
