"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

interface CountryData {
	countryCode: string;
	countryName: string;
	clicks: number;
}

export function GeoBreakdownCard({ companyId }: { companyId: string }) {
	const [countries, setCountries] = useState<CountryData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch(
					`/api/analytics/device-breakdown?companyId=${companyId}`
				);
				const data = await response.json();
				setCountries(data.countries || []);
			} catch (error) {
				console.error("[GeoBreakdownCard] Error:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [companyId]);

	if (loading) {
		return (
			<div className="rounded-2xl bg-white/5 dark:bg-black/5 backdrop-blur-xl border border-white/10 dark:border-white/5 p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-6 bg-white/10 dark:bg-black/10 rounded w-1/3" />
					<div className="space-y-3">
						<div className="h-12 bg-white/10 dark:bg-black/10 rounded" />
						<div className="h-12 bg-white/10 dark:bg-black/10 rounded" />
						<div className="h-12 bg-white/10 dark:bg-black/10 rounded" />
					</div>
				</div>
			</div>
		);
	}

	const totalClicks = countries.reduce((sum, c) => sum + c.clicks, 0);

	return (
		<div className="rounded-2xl bg-white/5 dark:bg-black/5 backdrop-blur-xl border border-white/10 dark:border-white/5 p-6">
			<div className="flex items-center gap-2 mb-6">
				<Globe className="h-5 w-5 text-muted-foreground" />
				<h3 className="text-lg font-semibold text-foreground">Top Countries</h3>
			</div>

			{countries.length > 0 ? (
				<div className="space-y-3">
					{countries.slice(0, 10).map((country) => {
						const percentage =
							totalClicks > 0 ? (country.clicks / totalClicks) * 100 : 0;

						return (
							<div
								key={country.countryCode}
								className="flex items-center justify-between"
							>
								<div className="flex items-center gap-3">
									<span className="text-2xl">
										{getCountryFlag(country.countryCode)}
									</span>
									<div>
										<div className="font-medium text-foreground">
											{country.countryName}
										</div>
										<div className="text-sm text-muted-foreground">
											{country.clicks.toLocaleString()} clicks
										</div>
									</div>
								</div>

								<div className="font-semibold text-foreground">
									{percentage.toFixed(1)}%
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<p className="text-sm text-muted-foreground text-center py-8">
					No location data yet. Clicks from different countries will appear here.
				</p>
			)}
		</div>
	);
}

function getCountryFlag(countryCode: string): string {
	// Convert country code to emoji flag
	if (!countryCode || countryCode === "XX") return "🌍";

	try {
		const codePoints = countryCode
			.toUpperCase()
			.split("")
			.map((char) => 127397 + char.charCodeAt(0));

		return String.fromCodePoint(...codePoints);
	} catch {
		return "🌍";
	}
}
