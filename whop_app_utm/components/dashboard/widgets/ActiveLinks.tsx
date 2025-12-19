"use client";

import { useEffect, useState } from "react";
import { Link2 } from "lucide-react";

export function ActiveLinks() {
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchLinks = async () => {
			try {
				const res = await fetch("/api/advanced-links-data");
				const json = await res.json();
				const links = json.links || [];

				// Count non-archived links
				const activeCount = links.filter((link: any) => !link.archived).length;
				setCount(activeCount);
			} catch (error) {
				console.error("Failed to fetch links:", error);
				setCount(0);
			} finally {
				setLoading(false);
			}
		};

		fetchLinks();
	}, []);

	if (loading) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col justify-between">
			<div className="flex items-center gap-2 mb-2">
				<Link2 className="h-4 w-4 text-blue-500" />
				<span className="text-[10px] text-muted-foreground uppercase tracking-wide">
					Active Links
				</span>
			</div>

			<div>
				<div className="text-3xl font-bold text-foreground">{count}</div>
				<div className="text-xs text-muted-foreground mt-1">
					{count === 1 ? "tracking link" : "tracking links"}
				</div>
			</div>
		</div>
	);
}
