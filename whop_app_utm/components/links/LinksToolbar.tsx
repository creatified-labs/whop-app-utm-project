"use client";

import React from "react";
import { Filter, Search } from "lucide-react";

type LinksToolbarProps = {
	placeholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	rightSlot?: React.ReactNode;
	onFilterClick?: () => void;
	isFilterActive?: boolean;
	showFilterButton?: boolean;
};

export function LinksToolbar({
	placeholder = "Search links",
	searchValue = "",
	onSearchChange,
	rightSlot,
	onFilterClick,
	isFilterActive,
	showFilterButton = true,
}: LinksToolbarProps) {

	return (
		<div className="flex items-center gap-2">
			{/* Search bar */}
			<div className="relative flex-1">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-white/80 pointer-events-none" />
				<input
					type="text"
					placeholder={placeholder}
					value={searchValue}
					onChange={(e) => onSearchChange?.(e.target.value)}
					className="w-full rounded-lg border border-transparent dark:border-[#1f1f1f] bg-white dark:bg-[#111111] shadow-sm dark:shadow-none pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-0 dark:focus:border-[#2a2a2a] transition-colors"
				/>
			</div>

			{showFilterButton && (
				<button
					type="button"
					aria-label="Open filters"
					onClick={onFilterClick}
					className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent dark:border-border shadow-sm transition-colors ${isFilterActive
							? "bg-[#050B1E] text-white dark:bg-white dark:text-black"
							: "bg-white dark:bg-[#111111] text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-[#1f1f1f]"
						}`}
				>
					<Filter className="h-3.5 w-3.5" />
				</button>
			)}

			{rightSlot}
		</div>
	);
}
