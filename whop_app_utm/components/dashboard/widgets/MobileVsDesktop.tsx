"use client";

import { useEffect, useState } from "react";
import * as Separator from "@radix-ui/react-separator";
import { Smartphone, Monitor } from "lucide-react";

interface DeviceData {
	deviceType: string;
	clicks: number;
	conversions: number;
	conversionRate: number;
	percentage: number;
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface MobileVsDesktopProps {
	size?: ModuleSize;
}

export function MobileVsDesktop({ size }: MobileVsDesktopProps = {}) {
	const [mobileData, setMobileData] = useState<DeviceData | null>(null);
	const [desktopData, setDesktopData] = useState<DeviceData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/analytics/device-breakdown");
				const json = await res.json();
				const devices = json.devices || [];

				const mobile = devices.find((d: DeviceData) => d.deviceType === "mobile");
				const desktop = devices.find((d: DeviceData) => d.deviceType === "desktop");

				setMobileData(mobile || { deviceType: "mobile", clicks: 0, conversions: 0, conversionRate: 0, percentage: 0 });
				setDesktopData(desktop || { deviceType: "desktop", clicks: 0, conversions: 0, conversionRate: 0, percentage: 0 });
			} catch (error) {
				console.error("Failed to fetch device data:", error);
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

	return (
		<div className="h-full flex flex-col">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
				Device Comparison
			</div>

			<div className="grid grid-cols-2 gap-4 flex-1">
				{/* Mobile */}
				<div className="flex flex-col space-y-2">
					<div className="flex items-center gap-2">
						<Smartphone className="h-4 w-4 text-blue-500" />
						<span className="text-xs font-semibold text-foreground">Mobile</span>
					</div>

					<div className="space-y-2">
						<div>
							<div className="text-2xl font-bold text-foreground">
								{mobileData?.percentage.toFixed(0)}%
							</div>
							<div className="text-[10px] text-muted-foreground">of traffic</div>
						</div>

						<Separator.Root
							orientation="horizontal"
							className="bg-white/10 h-px w-full my-2"
						/>
						<div className="space-y-1">
							<div className="flex justify-between items-center">
								<span className="text-[10px] text-muted-foreground">Clicks</span>
								<span className="text-xs font-medium text-foreground">
									{mobileData?.clicks.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[10px] text-muted-foreground">Orders</span>
								<span className="text-xs font-medium text-foreground">
									{mobileData?.conversions}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[10px] text-muted-foreground">CVR</span>
								<span className="text-xs font-medium text-blue-400">
									{mobileData?.conversionRate.toFixed(1)}%
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Desktop */}
				<div className="flex flex-col space-y-2">
					<div className="flex items-center gap-2">
						<Monitor className="h-4 w-4 text-emerald-500" />
						<span className="text-xs font-semibold text-foreground">Desktop</span>
					</div>

					<div className="space-y-2">
						<div>
							<div className="text-2xl font-bold text-foreground">
								{desktopData?.percentage.toFixed(0)}%
							</div>
							<div className="text-[10px] text-muted-foreground">of traffic</div>
						</div>

						<Separator.Root
							orientation="horizontal"
							className="bg-white/10 h-px w-full my-2"
						/>
						<div className="space-y-1">
							<div className="flex justify-between items-center">
								<span className="text-[10px] text-muted-foreground">Clicks</span>
								<span className="text-xs font-medium text-foreground">
									{desktopData?.clicks.toLocaleString()}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[10px] text-muted-foreground">Orders</span>
								<span className="text-xs font-medium text-foreground">
									{desktopData?.conversions}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-[10px] text-muted-foreground">CVR</span>
								<span className="text-xs font-medium text-emerald-400">
									{desktopData?.conversionRate.toFixed(1)}%
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
