"use client";

import { usePathname } from "next/navigation";

export function DashboardHeaderTitle() {
	const pathname = usePathname() || "";

	let title = "Dashboard";

	if (pathname.includes("/advanced-links")) {
		title = "Advanced tracking links";
	} else if (pathname.includes("/tracking-links") || pathname.includes("/links")) {
		title = "Tracking links";
	} else if (pathname.includes("/presets")) {
		title = "Presets";
	} else if (pathname.includes("/reports")) {
		title = "Reports";
	} else if (pathname.includes("/settings")) {
		title = "Settings";
	}

	// For pages where we render the title inline inside the main card (like
	// advanced-links and tracking-links), skip the global header title here to
	// avoid duplicated headings.
	if (pathname.includes("/advanced-links") || pathname.includes("/tracking-links")) {
		return null;
	}

	if (pathname.includes("/analytics")) {
		return (
			<div className="space-y-1 text-center">
				<h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold tracking-tight text-foreground">
					Analytics Dashboard
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Real-time UTM tracking and campaign performance across all links
				</p>
			</div>
		);
	}

	if (title === "Dashboard") {
		return (
			<div className="space-y-1 text-center">
				<h1
					className="tracking-tight text-black dark:text-white"
					style={{
						fontFamily:
							'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
						fontSize: "40px",
						fontWeight: 700,
						lineHeight: "50px",
					}}
				>
					{title}
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground">
					Track attributed revenue and performance across your Creatified UTM links
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-1">
			<h1 className="text-2xl sm:text-3xl lg:text-[32px] font-semibold tracking-tight text-foreground">
				{title}
			</h1>
		</div>
	);
}
