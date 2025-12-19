"use client";

interface ProgressBarProps {
	value: number;
	max?: number;
	color?: "blue" | "green" | "red" | "purple" | "emerald";
	showLabel?: boolean;
	height?: "sm" | "md" | "lg";
}

export function ProgressBar({
	value,
	max = 100,
	color = "blue",
	showLabel = true,
	height = "sm",
}: ProgressBarProps) {
	const percentage = Math.min((value / max) * 100, 100);

	const colorClasses = {
		blue: "bg-blue-500",
		green: "bg-green-500",
		red: "bg-red-500",
		purple: "bg-purple-500",
		emerald: "bg-emerald-500",
	};

	const heightClasses = {
		sm: "h-1.5",
		md: "h-2",
		lg: "h-2.5",
	};

	return (
		<div className="flex items-center gap-2">
			<div
				className={`flex-1 ${heightClasses[height]} bg-accent rounded-full overflow-hidden`}
			>
				<div
					className={`h-full ${colorClasses[color]} transition-all duration-300`}
					style={{ width: `${percentage}%` }}
				/>
			</div>
			{showLabel && (
				<span className="text-xs font-medium text-foreground w-12 text-right">
					{percentage.toFixed(0)}%
				</span>
			)}
		</div>
	);
}
