"use client";

import React, { useState } from "react";
import { LinksTableRow, type VisibleColumns } from "./LinksTableRow";
import { useUtmData, useLinkMetrics } from "@/lib/utm/hooks";
import type { TrackingLink, LinkMetrics } from "@/lib/utm/types";

type ResizableColumnKey =
	| "name"
	| "product"
	| "plan"
	| "url"
	| "destination"
	| "utmSource"
	| "utmMedium"
	| "utmCampaign"
	| "dateCreated"
	| "clicks"
	| "revenue"
	| "conversion"
	| "convertedUsers";

type LinksTableMode = "whop" | "advanced";

type LinksTableProps = {
	mode?: LinksTableMode;
	linksOverride?: TrackingLink[];
	metricsOverride?: LinkMetrics[];
	onArchiveLink?: (id: string) => void;
	onRestoreLink?: (id: string) => void;
	onDeleteLink?: (id: string) => void;
	isArchivedView?: boolean;
};

const COLUMN_MIN_WIDTHS: Record<ResizableColumnKey, number> = {
	name: 88,
	product: 104,
	plan: 80,
	url: 80,
	destination: 136,
	utmSource: 112,
	utmMedium: 112,
	utmCampaign: 144,
	dateCreated: 120,
	clicks: 88,
	revenue: 168,
	conversion: 160,
	convertedUsers: 168,
};

export function LinksTable({
	mode = "whop",
	linksOverride,
	metricsOverride,
	onArchiveLink,
	onRestoreLink,
	onDeleteLink,
	isArchivedView,
}: LinksTableProps) {
	const { links } = useUtmData();
	const linkMetrics = useLinkMetrics();

	const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
		product: true,
		plan: true,
		url: true,
		destination: true,
		utmSource: true,
		utmMedium: true,
		utmCampaign: true,
		dateCreated: true,
		clicks: true,
		revenue: true,
		conversion: true,
		convertedUsers: true,
	});

	const [columnWidths, setColumnWidths] = useState<Record<ResizableColumnKey, number>>({
		name: 220,
		product: 220,
		plan: 200,
		url: 240,
		destination: 220,
		utmSource: 160,
		utmMedium: 160,
		utmCampaign: 200,
		dateCreated: 140,
		clicks: 80,
		revenue: 200,
		conversion: 180,
		convertedUsers: 200,
	});

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	const handleColumnResizeStart = (
		key: ResizableColumnKey,
		event: React.MouseEvent<HTMLDivElement>,
	) => {
		event.preventDefault();
		event.stopPropagation();

		const startX = event.clientX;
		const startWidth = columnWidths[key];

		const onMouseMove = (moveEvent: MouseEvent) => {
			const delta = moveEvent.clientX - startX;
			const minWidth = COLUMN_MIN_WIDTHS[key];
			const nextWidth = Math.max(minWidth, startWidth + delta);
			setColumnWidths((prev) => ({
				...prev,
				[key]: nextWidth,
			}));
		};

		const onMouseUp = () => {
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	};

	const columnOptions: { key: keyof VisibleColumns; label: string }[] = [
		{ key: "product", label: "Product" },
		{ key: "plan", label: "Plan" },
		{ key: "url", label: "URL" },
		{ key: "destination", label: "Destination" },
		{ key: "utmSource", label: "UTM source" },
		{ key: "utmMedium", label: "UTM medium" },
		{ key: "utmCampaign", label: "UTM campaign" },
		{ key: "dateCreated", label: "Date created" },
		{ key: "clicks", label: "Clicks" },
		{ key: "revenue", label: "Revenue generated" },
		{ key: "conversion", label: "Conversion rate" },
		{ key: "convertedUsers", label: "Converted users" },
	];

	const effectiveLinks =
		mode === "advanced" && linksOverride ? linksOverride : links;

	const effectiveMetrics =
		mode === "advanced" && metricsOverride ? metricsOverride : linkMetrics;

	const rows = effectiveLinks.map((link) => ({
		link,
		metrics: effectiveMetrics.find((m) => m.linkId === link.id),
	}));

	return (
		<div className="mt-4 w-full min-h-[70vh] rounded-2xl bg-card/95 backdrop-blur-2xl flex flex-col overflow-hidden">
			<div className="w-full flex-1 overflow-x-auto">
				<table className="links-table w-full h-full table-fixed text-sm text-card-foreground border-separate border-spacing-0">
					<thead className="bg-card">
						<tr className="text-[11px] uppercase tracking-[0.16em] text-black dark:text-white">
							<th
								className="sticky left-0 z-20 px-4 py-2 text-left bg-card relative border-r border-b-2 border-border"
								style={{ width: columnWidths.name }}
							>
								<span className="block whitespace-nowrap">Name</span>
								<div
									className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
									onMouseDown={(event) => handleColumnResizeStart("name", event)}
								/>
							</th>
							{visibleColumns.product && (
								<th
									className="sticky z-20 px-4 py-2 text-left bg-card relative border-r border-b-2 border-border"
									style={{
										width: columnWidths.product,
										left: columnWidths.name,
									}}
								>
									<div className="inline-flex items-center pr-2">
										<span className="block whitespace-nowrap">Product</span>
									</div>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("product", event)}
									/>
								</th>
							)}
							{visibleColumns.plan && (
								<th
									className="relative px-4 py-2 text-left border-b-2 border-border"
									style={{ width: columnWidths.plan }}
								>
									<span className="block whitespace-nowrap">Plan</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("plan", event)}
									/>
								</th>
							)}
							{visibleColumns.url && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.url }}
								>
									<span className="block whitespace-nowrap">URL</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("url", event)}
									/>
								</th>
							)}
							{visibleColumns.destination && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.destination }}
								>
									<span className="block whitespace-nowrap">Destination</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("destination", event)}
									/>
								</th>
							)}
							{mode === "advanced" && visibleColumns.utmSource && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.utmSource }}
								>
									<span className="block whitespace-nowrap">UTM source</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("utmSource", event)}
									/>
								</th>
							)}
							{mode === "advanced" && visibleColumns.utmMedium && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.utmMedium }}
								>
									<span className="block whitespace-nowrap">UTM medium</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("utmMedium", event)}
									/>
								</th>
							)}
							{mode === "advanced" && visibleColumns.utmCampaign && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.utmCampaign }}
								>
									<span className="block whitespace-nowrap">UTM campaign</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("utmCampaign", event)}
									/>
								</th>
							)}
							{mode === "advanced" && visibleColumns.dateCreated && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.dateCreated }}
								>
									<span className="block whitespace-nowrap">Date created</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("dateCreated", event)}
									/>
								</th>
							)}
							{visibleColumns.clicks && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.clicks }}
								>
									<span className="block whitespace-nowrap">Clicks</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("clicks", event)}
									/>
								</th>
							)}
							{visibleColumns.revenue && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.revenue }}
								>
									<span className="block whitespace-nowrap">Revenue generated</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("revenue", event)}
									/>
								</th>
							)}
							{visibleColumns.conversion && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.conversion }}
								>
									<span className="block whitespace-nowrap">Conversion rate</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("conversion", event)}
									/>
								</th>
							)}
							{visibleColumns.convertedUsers && (
								<th
									className="relative px-4 py-2 text-left border-l border-b-2 border-border"
									style={{ width: columnWidths.convertedUsers }}
								>
									<span className="block whitespace-nowrap">Converted users</span>
									<div
										className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20"
										onMouseDown={(event) => handleColumnResizeStart("convertedUsers", event)}
									/>
								</th>
							)}
							<th className="sticky right-0 z-20 w-12 px-4 py-2 text-right align-middle whitespace-nowrap bg-card relative">
								<div className="flex justify-center">
									<button
										type="button"
										className="inline-flex h-6 aspect-square items-center justify-center rounded-full bg-transparent text-[12px] text-muted-foreground hover:bg-accent/40 dark:hover:bg-accent/60 transition-colors"
										onClick={() => setIsSettingsOpen((open) => !open)}
									>
										··
									</button>
									<span className="pointer-events-none absolute left-0 top-0 bottom-0 w-[2px] bg-border" />
									{isSettingsOpen && (
										<div className="absolute right-2 top-9 z-40 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-[var(--glass-shadow)] text-xs overflow-hidden">
											<div className="px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground bg-muted/40 border-b border-border">
												Columns
											</div>
											<div className="py-1">
												{columnOptions.map(({ key, label }) => {
													const checked = visibleColumns[key];
													return (
														<button
															key={key}
															type="button"
															onClick={() =>
																setVisibleColumns((prev) => ({
																	...prev,
																	[key]: !prev[key],
																}))
															}
															className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[12px] text-foreground hover:bg-accent"
														>
															<span>{label}</span>
															<span
																className={[
																	"inline-flex h-4 w-4 items-center justify-center rounded-[6px] border text-[10px]",
																	checked
																		? "border-primary bg-primary text-primary-foreground"
																		: "border-border bg-transparent text-transparent",
																].join(" ")}
															>
																✓
															</span>
														</button>
													);
												})}
											</div>
										</div>
									)}
								</div>
								<span className="pointer-events-none absolute left-0 top-0 bottom-0 w-px bg-border" />
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(({ link, metrics }) => (
							<LinksTableRow
								key={link.id}
								link={link}
								metrics={metrics}
								visibleColumns={visibleColumns}
								columnWidths={{ name: columnWidths.name, product: columnWidths.product }}
								mode={mode}
								onArchiveLink={onArchiveLink}
								onRestoreLink={onRestoreLink}
								onDeleteLink={onDeleteLink}
								isArchivedView={isArchivedView}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
