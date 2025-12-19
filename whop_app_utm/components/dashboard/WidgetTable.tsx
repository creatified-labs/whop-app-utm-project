"use client";

import * as Separator from "@radix-ui/react-separator";
import { TrendIndicator } from "./TrendIndicator";

export interface TableRow {
	label: string;
	clicks: number;
	orders: number;
	revenue: number;
	cvr: number;
	trend?: number;
}

interface WidgetTableProps {
	rows: TableRow[];
	maxRows?: number;
	sortBy?: keyof TableRow;
	sortOrder?: "asc" | "desc";
	showProgressBars?: boolean;
}

export function WidgetTable({
	rows,
	maxRows = 5,
	sortBy = "revenue",
	sortOrder = "desc",
	showProgressBars = false,
}: WidgetTableProps) {
	const sortedRows = [...rows]
		.sort((a, b) => {
			const aVal = a[sortBy] as number;
			const bVal = b[sortBy] as number;
			return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
		})
		.slice(0, maxRows);

	// Calculate max value for progress bars
	const maxValue = sortedRows.length > 0 ? Math.max(...sortedRows.map((r) => r[sortBy] as number)) : 1;

	if (sortedRows.length === 0) {
		return (
			<div className="flex items-center justify-center h-full py-8">
				<p className="text-sm text-muted-foreground">No data available</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Header */}
			<div className="grid grid-cols-5 gap-2 pb-2">
				<div className="text-[10px] text-muted-foreground uppercase tracking-wide">
					Name
				</div>
				<div className="text-[10px] text-muted-foreground uppercase tracking-wide text-right">
					Clicks
				</div>
				<div className="text-[10px] text-muted-foreground uppercase tracking-wide text-right">
					Orders
				</div>
				<div className="text-[10px] text-muted-foreground uppercase tracking-wide text-right">
					Revenue
				</div>
				<div className="text-[10px] text-muted-foreground uppercase tracking-wide text-right">
					CVR
				</div>
			</div>
			<Separator.Root
				orientation="horizontal"
				className="bg-white/10 h-px w-full"
				style={{ margin: '0' }}
			/>

			{/* Rows */}
			{sortedRows.map((row, idx) => {
				const progressPercentage = ((row[sortBy] as number) / maxValue) * 100;

				return (
					<div key={idx} className="space-y-1">
						<div className="grid grid-cols-5 gap-2 py-1.5 hover:bg-white/5 rounded transition-colors">
							<div className="text-xs font-medium text-foreground truncate" title={row.label}>
								{row.label}
							</div>
							<div className="text-xs text-foreground text-right">
								{row.clicks.toLocaleString()}
							</div>
							<div className="text-xs text-foreground text-right">
								{row.orders}
							</div>
							<div className="text-xs text-emerald-400 font-medium text-right">
								${row.revenue.toFixed(0)}
							</div>
							<div className="text-xs text-foreground text-right flex items-center justify-end gap-1">
								<span>{row.cvr.toFixed(1)}%</span>
								{row.trend !== undefined && (
									<TrendIndicator value={row.trend} suffix="" showValue={false} />
								)}
							</div>
						</div>
						{showProgressBars && (
							<div className="px-0.5">
								<div className="h-1 bg-accent rounded-full overflow-hidden">
									<div
										className="h-full bg-blue-500 transition-all duration-300"
										style={{ width: `${progressPercentage}%` }}
									/>
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
