"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/dashboard/ProgressBar";

interface OSData {
	os: string;
	count: number;
	percentage: number;
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface OSDistributionProps {
	size?: ModuleSize;
}

export function OSDistribution({ size }: OSDistributionProps = {}) {
	const [data, setData] = useState<OSData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/reports/os-breakdown");
				const json = await res.json();
				const osData = json.breakdown || [];

				// Take top 5 operating systems
				setData(osData.slice(0, 5));
			} catch (error) {
				console.error("Failed to fetch OS data:", error);
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
				<div className="text-sm font-medium text-foreground">No OS data yet</div>
				<div className="text-xs text-muted-foreground mt-1">
					Operating system analytics will appear here once you have tracking sessions
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
				Operating Systems
			</div>

			<div className="space-y-3 flex-1">
				{data.map((os) => (
					<div key={os.os} className="space-y-1.5">
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-foreground truncate">
								{os.os}
							</span>
							<span className="text-xs font-bold text-foreground">
								{os.percentage.toFixed(0)}%
							</span>
						</div>

						<ProgressBar
							value={os.percentage}
							max={100}
							color="purple"
							showLabel={false}
							height="sm"
						/>

						<div className="text-[10px] text-muted-foreground">
							{os.count.toLocaleString()} sessions
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
