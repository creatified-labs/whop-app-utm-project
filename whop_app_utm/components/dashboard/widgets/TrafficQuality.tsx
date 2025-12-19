"use client";

import { useEffect, useState } from "react";
import * as Separator from "@radix-ui/react-separator";
import { ProgressBar } from "@/components/dashboard/ProgressBar";

interface DeviceData {
	deviceType: string;
	clicks: number;
	conversions: number;
	conversionRate: number;
}

type ModuleSize = "1x1" | "2x1" | "1x2" | "2x2";

interface TrafficQualityProps {
	size?: ModuleSize;
}

export function TrafficQuality({ size }: TrafficQualityProps = {}) {
	const [data, setData] = useState<DeviceData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch("/api/analytics/device-breakdown");
				const json = await res.json();
				const devices = json.devices || [];

				setData(devices);
			} catch (error) {
				console.error("Failed to fetch device data:", error);
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
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">No traffic data yet</div>
			</div>
		);
	}

	// Function to get color based on CVR
	const getQualityColor = (cvr: number): "emerald" | "blue" | "red" => {
		if (cvr >= 5) return "emerald";
		if (cvr >= 2) return "blue";
		return "red";
	};

	return (
		<div className="h-full flex flex-col">
			<div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">
				Conversion Rate by Device
			</div>

			<div className="space-y-3 flex-1">
				{data.map((device) => {
					const color = getQualityColor(device.conversionRate);

					return (
						<div key={device.deviceType} className="space-y-1.5">
							<div className="flex items-center justify-between">
								<span className="text-xs font-medium text-foreground capitalize">
									{device.deviceType}
								</span>
								<span className="text-xs font-bold text-foreground">
									{device.conversionRate.toFixed(1)}%
								</span>
							</div>

							<ProgressBar
								value={device.conversionRate}
								max={10} // Max CVR of 10% for scale
								color={color}
								showLabel={false}
								height="sm"
							/>

							<div className="flex items-center justify-between text-[10px] text-muted-foreground">
								<span>{device.clicks.toLocaleString()} clicks</span>
								<span>{device.conversions} orders</span>
							</div>
						</div>
					);
				})}
			</div>

			<div className="mt-4 pt-3">
				<Separator.Root
					orientation="horizontal"
					className="bg-white/10 h-px w-full mb-3"
				/>
				<div className="flex items-center gap-3 text-[10px]">
					<div className="flex items-center gap-1">
						<div className="w-2 h-2 rounded-full bg-emerald-500" />
						<span className="text-muted-foreground">Excellent (≥5%)</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="w-2 h-2 rounded-full bg-blue-500" />
						<span className="text-muted-foreground">Good (2-5%)</span>
					</div>
					<div className="flex items-center gap-1">
						<div className="w-2 h-2 rounded-full bg-red-500" />
						<span className="text-muted-foreground">Poor (&lt;2%)</span>
					</div>
				</div>
			</div>
		</div>
	);
}
