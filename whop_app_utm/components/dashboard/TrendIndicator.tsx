"use client";

interface TrendIndicatorProps {
	value: number;
	suffix?: string;
	showValue?: boolean;
}

export function TrendIndicator({
	value,
	suffix = "%",
	showValue = true,
}: TrendIndicatorProps) {
	const isPositive = value > 0;
	const isNeutral = value === 0;

	const colorClass = isPositive
		? "text-emerald-500"
		: isNeutral
			? "text-gray-500"
			: "text-red-500";

	const arrow = isPositive ? "↑" : isNeutral ? "→" : "↓";

	return (
		<span
			className={`inline-flex items-center gap-0.5 text-xs font-medium ${colorClass}`}
		>
			<span>{arrow}</span>
			{showValue && (
				<span>
					{Math.abs(value).toFixed(1)}
					{suffix}
				</span>
			)}
		</span>
	);
}
