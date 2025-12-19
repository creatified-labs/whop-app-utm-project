"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Monitor, Smartphone, Tablet } from "lucide-react";

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

type DeviceBreakdown = {
	deviceType: string;
	count: number;
	percentage: number;
};

type BrowserBreakdown = {
	browser: string;
	count: number;
	percentage: number;
};

type CountryBreakdown = {
	countryCode: string;
	count: number;
	percentage: number;
};

type BreakdownData = {
	totalSessions: number;
	devices: DeviceBreakdown[];
	browsers: BrowserBreakdown[];
	countries: CountryBreakdown[];
};

interface DeviceBreakdownCardProps {
	size?: ModuleSize;
}

export function DeviceBreakdownCard({ size = "1x1" }: DeviceBreakdownCardProps) {
	const [data, setData] = useState<BreakdownData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			try {
				const res = await fetch("/api/device-breakdown");
				if (res.ok) {
					const json = await res.json();
					setData(json);
				}
			} catch (error) {
				console.error("[DeviceBreakdownCard] Failed to load:", error);
			} finally {
				setLoading(false);
			}
		}

		void loadData();
	}, []);

	if (loading) {
		return (
			<DashboardCard className="h-full min-h-[280px] flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</DashboardCard>
		);
	}

	if (!data || data.totalSessions === 0) {
		return (
			<DashboardCard className="h-full min-h-[280px] flex items-center justify-center">
				<div className="text-center">
					<p className="text-sm text-muted-foreground">No session data yet</p>
					<p className="text-xs text-muted-foreground mt-1">
						Data will appear after clicks are tracked
					</p>
				</div>
			</DashboardCard>
		);
	}

	const getDeviceIcon = (deviceType: string) => {
		switch (deviceType.toLowerCase()) {
			case "mobile":
				return <Smartphone className="h-4 w-4" />;
			case "tablet":
				return <Tablet className="h-4 w-4" />;
			case "desktop":
			default:
				return <Monitor className="h-4 w-4" />;
		}
	};

	const getDeviceColor = (deviceType: string) => {
		switch (deviceType.toLowerCase()) {
			case "mobile":
				return "bg-blue-500";
			case "tablet":
				return "bg-purple-500";
			case "desktop":
			default:
				return "bg-green-500";
		}
	};

	const isCompact = size === "1x1";

	return (
		<DashboardCard className="h-full flex flex-col overflow-hidden p-4 sm:p-5">
			<div className={`${isCompact ? 'mb-2' : 'mb-4'} flex-shrink-0`}>
				<h3 className="text-sm font-semibold text-foreground">Device Breakdown</h3>
				<p className="text-[10px] text-muted-foreground mt-0.5">
					{data.totalSessions.toLocaleString()} total sessions
				</p>
			</div>

			<div className="flex-1 min-h-0 overflow-y-auto space-y-3">
				{/* Device Type Breakdown */}
				<div>
					<h4 className={`text-xs font-medium text-muted-foreground ${isCompact ? 'mb-1.5' : 'mb-2'}`}>
						By Device
					</h4>
					<div className={`space-y-${isCompact ? '1.5' : '2'}`}>
						{data.devices.map((device) => (
							<div key={device.deviceType} className="flex items-center gap-2">
								<div className="flex items-center gap-2 flex-1 min-w-0">
									<div className={`p-1 rounded ${getDeviceColor(device.deviceType)}`}>
										{getDeviceIcon(device.deviceType)}
									</div>
									<span className="text-xs text-foreground capitalize truncate">
										{device.deviceType}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-16 h-1.5 bg-accent rounded-full overflow-hidden">
										<div
											className={`h-full ${getDeviceColor(device.deviceType)}`}
											style={{ width: `${device.percentage}%` }}
										/>
									</div>
									<span className="text-xs font-medium text-foreground w-10 text-right">
										{device.percentage.toFixed(0)}%
									</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Browser Breakdown - Hide in compact mode if space is tight */}
				{!isCompact && data.browsers.length > 0 && (
					<div className="pt-3 border-t border-white/5">
						<h4 className="text-xs font-medium text-muted-foreground mb-2">Top Browsers</h4>
						<div className="space-y-1.5">
							{data.browsers.slice(0, 3).map((browser) => (
								<div key={browser.browser} className="flex items-center justify-between">
									<span className="text-xs text-foreground truncate flex-1">
										{browser.browser}
									</span>
									<span className="text-xs text-muted-foreground">
										{browser.percentage.toFixed(0)}%
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Country Breakdown - Hide in compact mode if space is tight */}
				{!isCompact && data.countries.length > 0 && (
					<div className="pt-3 border-t border-white/5">
						<h4 className="text-xs font-medium text-muted-foreground mb-2">Top Countries</h4>
						<div className="space-y-1.5">
							{data.countries.slice(0, 3).map((country) => (
								<div key={country.countryCode} className="flex items-center justify-between">
									<span className="text-xs text-foreground font-mono">
										{country.countryCode}
									</span>
									<span className="text-xs text-muted-foreground">
										{country.percentage.toFixed(0)}%
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</DashboardCard>
	);
}
