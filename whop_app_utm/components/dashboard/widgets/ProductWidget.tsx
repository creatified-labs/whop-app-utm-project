"use client";

import { useEffect, useState } from "react";
import * as Separator from "@radix-ui/react-separator";

interface ProductData {
	product: string;
	clicks: number;
	orders: number;
	revenue: number;
	conversionRate: number;
}

export function ProductWidget({ productName }: { productName?: string }) {
	const [data, setData] = useState<ProductData[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const endDate = new Date();
				const startDate = new Date();
				startDate.setDate(startDate.getDate() - 30);

				const res = await fetch(
					`/api/reports/product-breakdown?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
				);
				const json = await res.json();
				setData(json.breakdown || []);
			} catch (error) {
				console.error("Failed to fetch product data:", error);
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

	const productData = productName
		? data.find((d) => d.product === productName)
		: data[0];

	const displayData = productData || {
		product: "No products yet",
		clicks: 0,
		revenue: 0,
		orders: 0,
		conversionRate: 0,
	};

	return (
		<div className="h-full flex flex-col">
			<div className="space-y-3">
				<div>
					<div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
						Product
					</div>
					<div className="text-lg font-bold text-foreground truncate">
						{displayData.product}
					</div>
				</div>

				<Separator.Root
					orientation="horizontal"
					className="bg-white/5 h-px w-full my-2"
				/>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<div className="text-2xl font-bold text-foreground">
							{displayData.clicks.toLocaleString()}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
							Clicks
						</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-emerald-400">
							${displayData.revenue.toFixed(2)}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
							Revenue
						</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-foreground">
							{displayData.orders}
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
							Orders
						</div>
					</div>
					<div>
						<div className="text-2xl font-bold text-blue-400">
							{displayData.conversionRate.toFixed(1)}%
						</div>
						<div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
							CVR
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
