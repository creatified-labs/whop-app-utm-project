"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/dashboard/ProgressBar";

interface BrowserData {
	browser: string;
	count: number;
	percentage: number;
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface BrowserAnalyticsProps {
	size?: ModuleSize;
}

export function BrowserAnalytics({ size }: BrowserAnalyticsProps = {}) {
	const [data, setData] = useState<BrowserData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/reports/browser-breakdown");
				const json = await res.json();
				const browsers = json.breakdown || [];

				// Take top 5 browsers
				setData(browsers.slice(0, 5));
			} catch (error) {
				console.error("Failed to fetch browser data:", error);
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

	if (data.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-center p-4">
				<div className="text-sm font-medium text-foreground">No browser data yet</div>
				<div className="text-xs text-muted-foreground mt-1">
					Browser analytics will appear here once you have tracking sessions
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
				Top Browsers
			</div>

			<div className="space-y-3 flex-1">
				{data.map((browser) => (
					<div key={browser.browser} className="space-y-1.5">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-foreground truncate">
								{browser.browser}
							</span>
							<span className="text-xs font-bold text-foreground">
								{browser.percentage.toFixed(0)}%
							</span>
						</div>

						<ProgressBar
							value={browser.percentage}
							max={100}
							color="blue"
							showLabel={false}
							height="sm"
						/>

						<div className="text-[10px] text-muted-foreground">
							{browser.count.toLocaleString()} sessions
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
