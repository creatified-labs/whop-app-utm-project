"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@whop/react/components";

type TimeSeriesData = {
	date: string;
	revenue: number;
	orders: number;
};

type Props = {
	startDate: string;
	endDate: string;
	granularity: string;
};

export function ReportsPerformanceChart({ startDate, endDate, granularity }: Props) {
	const [data, setData] = useState<TimeSeriesData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			if (!startDate || !endDate) return;

			setLoading(true);
			try {
				const params = new URLSearchParams();
				params.append("startDate", startDate);
				params.append("endDate", endDate);
				params.append("granularity", granularity);

				const res = await fetch(`/api/reports/revenue-over-time?${params.toString()}`);
				if (res.ok) {
					const json = await res.json();
					setData(json.timeSeries || []);
				}
			} catch (error) {
				console.error("[ReportsPerformanceChart] Failed to load:", error);
			} finally {
				setLoading(false);
			}
		}

		void loadData();
	}, [startDate, endDate, granularity]);

	// Generate SVG path from data
	const generatePath = (values: number[], maxValue: number) => {
		if (values.length === 0) return "M0 20 L100 20";

		const step = 100 / Math.max(values.length - 1, 1);
		const points = values.map((value, index) => {
			const x = index * step;
			const y = 40 - (value / maxValue) * 30; // Scale to fit 0-40 viewBox
			return `${x} ${y}`;
		});

		return `M${points.join(" L")}`;
	};

	const revenues = data.map(d => d.revenue);
	const orders = data.map(d => d.orders);
	const maxRevenue = Math.max(...revenues, 1);
	const maxOrders = Math.max(...orders, 1);

	const revenuePath = generatePath(revenues, maxRevenue);
	const ordersPath = generatePath(orders, maxOrders);

	return (
		<Card
			size="3"
			variant="surface"
			className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:bg-white/10 hover:scale-[1.01] transition-all duration-200 flex flex-col gap-6"
		>
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="text-lg font-semibold text-white tracking-tight">
						Performance Over Time
					</h2>
					<p className="text-xs text-slate-400 mt-1">
						Clicks and mock revenue trends across your campaigns.
					</p>
				</div>
				<div className="flex items-center gap-3 text-xs text-slate-300">
					<span className="inline-flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-sky-400" />
						<span>Clicks</span>
					</span>
					<span className="inline-flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-emerald-400" />
						<span>Revenue</span>
					</span>
				</div>
			</div>

			<div className="relative w-full min-h-[220px] overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
				<svg viewBox="0 0 100 40" className="w-full h-full text-slate-500/40">
					{[8, 16, 24, 32].map((y) => (
						<line
							key={y}
							x1="0"
							y1={y}
							x2="100"
							y2={y}
							stroke="currentColor"
							strokeWidth="0.3"
						/>
					))}
					<defs>
						<linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
							<stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
						</linearGradient>
					</defs>
					<path
						d={`${ordersPath} L100 40 L0 40 Z`}
						fill="url(#clicksGradient)"
						stroke="none"
					/>
					<path
						d={ordersPath}
						fill="none"
						stroke="#38bdf8"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d={revenuePath}
						fill="none"
						stroke="#4ade80"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>

			{loading ? (
				<p className="text-xs text-slate-400">Loading chart data...</p>
			) : data.length === 0 ? (
				<p className="text-xs text-slate-400">No data available for selected date range.</p>
			) : (
				<p className="text-xs text-slate-400">
					Showing {data.length} data points from {startDate} to {endDate}.
				</p>
			)}
		</Card>
	);
}
