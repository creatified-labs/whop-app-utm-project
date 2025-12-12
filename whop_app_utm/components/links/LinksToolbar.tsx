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
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
				<input
					type="text"
					placeholder={placeholder}
					value={searchValue}
					onChange={(e) => onSearchChange?.(e.target.value)}
					className="w-full rounded-xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/5 backdrop-blur-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-white/30 dark:placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all duration-200"
				/>
			</div>

			{showFilterButton && (
				<button
					type="button"
					aria-label="Open filters"
					onClick={onFilterClick}
					className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-xl transition-all duration-200 ${isFilterActive
						? "bg-blue-500/20 border-blue-400/30 text-blue-300"
						: "bg-white/5 dark:bg-black/5 border-white/10 dark:border-white/5 text-muted-foreground hover:bg-white/10 dark:hover:bg-white/[0.02]"
						}`}
				>
					<Filter className="h-3.5 w-3.5" />
				</button>
			)}

			{rightSlot}
		</div>
	);
}
