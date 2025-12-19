"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { Globe } from "lucide-react";

interface GeoData {
	countryCode: string;
	countryName: string;
	sessions: number;
	orders: number;
	revenue: number;
	percentage: number;
}

// Country code to flag emoji
function getFlagEmoji(countryCode: string): string {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt(0));
	return String.fromCodePoint(...codePoints);
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface GeographicOverviewProps {
	size?: ModuleSize;
}

export function GeographicOverview({ size }: GeographicOverviewProps = {}) {
	const [data, setData] = useState<GeoData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/reports/geographic-breakdown");
				const json = await res.json();
				const geoData = json.breakdown || [];

				// Take top 5 countries by revenue
				setData(geoData.slice(0, 5));
			} catch (error) {
				console.error("Failed to fetch geographic data:", error);
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
				<Globe className="h-8 w-8 text-muted-foreground mb-2" />
				<div className="text-sm font-medium text-foreground">No geographic data yet</div>
				<div className="text-xs text-muted-foreground mt-1">
					Country analytics will appear here once you have tracking sessions
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
				Top Countries
			</div>

			<div className="space-y-4 flex-1">
				{data.map((country) => (
					<div key={country.countryCode} className="space-y-2">
						<div className="flex items-center gap-2">
							<span className="text-lg" title={country.countryName}>
								{getFlagEmoji(country.countryCode)}
							</span>
							<div className="flex-1">
								<div className="text-xs font-semibold text-foreground truncate">
									{country.countryName}
								</div>
								<div className="text-[10px] text-muted-foreground">
									{country.sessions.toLocaleString()} sessions
								</div>
							</div>
						</div>

						<ProgressBar
							value={country.percentage}
							max={100}
							color="emerald"
							showLabel={true}
							height="sm"
						/>

						<div className="flex items-center justify-between text-xs">
							<span className="text-emerald-400 font-medium">
								${country.revenue.toFixed(2)}
							</span>
							<span className="text-muted-foreground">{country.orders} orders</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
