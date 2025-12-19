"use client";

interface CircularProgressProps {
	value: number;
	max?: number;
	size?: number;
	strokeWidth?: number;
	label?: string;
	showPercentage?: boolean;
}

export function CircularProgress({
	value,
	max = 100,
	size = 120,
	strokeWidth = 8,
	label = "",
	showPercentage = true,
}: CircularProgressProps) {
	const percentage = Math.min((value / max) * 100, 100);
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (percentage / 100) * circumference;

	// Color based on performance (CVR thresholds)
	const color =
		percentage >= 5 ? "#10b981" : percentage >= 2 ? "#f59e0b" : "#ef4444";

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg
				width={size}
				height={size}
				className="transform -rotate-90"
			>
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-white/10"
				/>
				{/* Progress circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className="transition-all duration-500"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				{showPercentage && (
					<span className="text-2xl font-bold text-foreground">
						{value.toFixed(1)}%
					</span>
				)}
				{label && (
					<span className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
						{label}
					</span>
				)}
			</div>
		</div>
	);
}
