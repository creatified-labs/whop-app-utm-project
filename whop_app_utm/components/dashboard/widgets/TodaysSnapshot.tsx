"use client";

import { useEffect, useState, useMemo } from "react";
import { TrendIndicator } from "@/components/dashboard/TrendIndicator";
import { useUtmData } from "@/lib/utm/hooks";

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface TodaysSnapshotProps {
	size?: ModuleSize;
}

export function TodaysSnapshot({ size }: TodaysSnapshotProps = {}) {
	const { orders } = useUtmData();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (orders.length >= 0) {
			setLoading(false);
		}
	}, [orders]);

	const { todayRevenue, yesterdayRevenue, changePercentage } = useMemo(() => {
		const now = new Date();
		const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

		const todayRevenue = orders
			.filter((order) => {
				const orderDate = new Date(order.createdAt);
				return orderDate >= todayStart;
			})
			.reduce((sum, order) => sum + order.amount, 0);

		const yesterdayRevenue = orders
			.filter((order) => {
				const orderDate = new Date(order.createdAt);
				return orderDate >= yesterdayStart && orderDate < todayStart;
			})
			.reduce((sum, order) => sum + order.amount, 0);

		const changePercentage =
			yesterdayRevenue > 0
				? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
				: todayRevenue > 0
					? 100
					: 0;

		return { todayRevenue, yesterdayRevenue, changePercentage };
	}, [orders]);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col justify-between">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
				Today
			</div>

			<div>
				<div className="text-3xl font-bold text-foreground">
					${todayRevenue.toLocaleString()}
				</div>
				<div className="flex items-center gap-2 mt-2">
					<span className="text-xs text-muted-foreground">vs yesterday</span>
					<TrendIndicator value={changePercentage} />
				</div>
			</div>
		</div>
	);
}
