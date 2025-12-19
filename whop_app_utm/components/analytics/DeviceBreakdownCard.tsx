"use client";

import { useEffect, useState } from "react";
import { Smartphone, Tablet, Monitor, HelpCircle } from "lucide-react";

interface DeviceData {
	deviceType: string;
	clicks: number;
	conversions: number;
	percentage: number;
	conversionRate: number;
}

interface BrowserData {
	browser: string;
	clicks: number;
}

export function DeviceBreakdownCard({ companyId }: { companyId: string }) {
	const [devices, setDevices] = useState<DeviceData[]>([]);
	const [browsers, setBrowsers] = useState<BrowserData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch(
					`/api/analytics/device-breakdown?companyId=${companyId}`
				);
				const data = await response.json();
				setDevices(data.devices || []);
				setBrowsers(data.browsers || []);
			} catch (error) {
				console.error("[DeviceBreakdownCard] Error:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, [companyId]);

	const getDeviceIcon = (type: string) => {
		switch (type) {
			case "mobile":
				return <Smartphone className="h-5 w-5" />;
			case "tablet":
				return <Tablet className="h-5 w-5" />;
			case "desktop":
				return <Monitor className="h-5 w-5" />;
			default:
				return <HelpCircle className="h-5 w-5" />;
		}
	};

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

	return (
		<div className="rounded-2xl bg-white/5 dark:bg-black/5 backdrop-blur-xl border border-white/10 dark:border-white/5 p-6">
			<h3 className="text-lg font-semibold text-foreground mb-6">
				Device Breakdown
			</h3>

			{devices.length > 0 ? (
				<div className="space-y-4">
					{devices.map((device) => (
						<div
							key={device.deviceType}
							className="flex items-center justify-between"
						>
							<div className="flex items-center gap-3">
								<div className="text-muted-foreground">
									{getDeviceIcon(device.deviceType)}
								</div>
								<div>
									<div className="font-medium text-foreground capitalize">
										{device.deviceType}
									</div>
									<div className="text-sm text-muted-foreground">
										{device.clicks.toLocaleString()} clicks
									</div>
								</div>
							</div>

							<div className="text-right">
								<div className="font-semibold text-foreground">
									{device.percentage.toFixed(1)}%
								</div>
								<div className="text-xs text-muted-foreground">
									{device.conversionRate.toFixed(1)}% CVR
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-muted-foreground text-center py-8">
					No device data yet. Create a tracking link and get some clicks!
				</p>
			)}

			{browsers.length > 0 && (
				<>
					<div className="mt-8 mb-4 border-t border-white/10 dark:border-white/5 pt-6">
						<h4 className="text-sm font-semibold text-foreground mb-4">
							Top Browsers
						</h4>
					</div>
					<div className="space-y-2">
						{browsers.slice(0, 5).map((browser) => (
							<div
								key={browser.browser}
								className="flex items-center justify-between text-sm"
							>
								<span className="text-muted-foreground">{browser.browser}</span>
								<span className="font-medium text-foreground">
									{browser.clicks.toLocaleString()}
								</span>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
