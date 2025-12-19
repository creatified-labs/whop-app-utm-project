"use client";

import { useEffect, useState } from "react";
import * as Separator from "@radix-ui/react-separator";
import { Clock } from "lucide-react";

interface HourData {
	hour: number;
	orders: number;
	revenue: number;
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface PeakHoursProps {
	size?: ModuleSize;
}

export function PeakHours({ size }: PeakHoursProps = {}) {
	const [data, setData] = useState<HourData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/reports/peak-hours");
				const json = await res.json();
				setData(json.breakdown || []);
			} catch (error) {
				console.error("Failed to fetch peak hours data:", error);
				setData([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (data.length === 0 || data.every((d) => d.orders === 0)) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-center p-4">
				<Clock className="h-8 w-8 text-muted-foreground mb-2" />
				<div className="text-sm font-medium text-foreground">No order data yet</div>
				<div className="text-xs text-muted-foreground mt-1">
					Peak hours will appear here once you have orders
				</div>
			</div>
		);
	}

	// Find max orders for scaling
	const maxOrders = Math.max(...data.map((d) => d.orders), 1);

	// Get top 3 peak hours
	const topHours = [...data]
		.filter((d) => d.orders > 0)
		.sort((a, b) => b.orders - a.orders)
		.slice(0, 3);

	// Format hour to 12-hour time
	const formatHour = (hour: number): string => {
		if (hour === 0) return "12 AM";
		if (hour === 12) return "12 PM";
		return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
	};

	return (
		<div className="h-full flex flex-col">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
				Peak Order Hours
			</div>

			{/* Bar chart */}
			<div className="flex-1 flex items-end justify-between gap-0.5 mb-4">
				{data.map((item) => {
					const heightPercent = (item.orders / maxOrders) * 100;
					const isPeak = topHours.some((top) => top.hour === item.hour);

					return (
						<div
							key={item.hour}
							className="flex-1 flex flex-col items-center justify-end group relative"
						>
							<div
								className={`w-full rounded-t transition-all ${isPeak ? "bg-emerald-500" : "bg-blue-500/50"
									} hover:bg-emerald-400`}
								style={{ height: `${Math.max(heightPercent, 2)}%` }}
								title={`${formatHour(item.hour)}: ${item.orders} orders`}
							/>
							{/* Hour label - show for every 4th hour */}
							{item.hour % 4 === 0 && (
								<div className="text-[8px] text-muted-foreground mt-1 absolute -bottom-4">
									{item.hour}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Top 3 hours */}
			<div className="mt-auto pt-4">
				<Separator.Root
					orientation="horizontal"
					className="bg-white/10 h-px w-full mb-4"
				/>
				<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
					Top Hours
				</div>
				<div className="grid grid-cols-3 gap-2">
					{topHours.map((hour, idx) => (
						<div key={hour.hour} className="text-center">
							<div className="text-xs font-bold text-foreground">{formatHour(hour.hour)}</div>
							<div className="text-[10px] text-muted-foreground">
								{hour.orders} orders
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
