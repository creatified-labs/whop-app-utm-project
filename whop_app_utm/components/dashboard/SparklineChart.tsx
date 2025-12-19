"use client";

interface DataPoint {
	date: string;
	value: number;
}

interface SparklineChartProps {
	data: DataPoint[];
	color?: string;
	height?: number;
	showDots?: boolean;
	showArea?: boolean;
}

export function SparklineChart({
	data,
	color = "#3b82f6",
	height = 64,
	showDots = false,
	showArea = true,
}: SparklineChartProps) {
	if (!data || data.length === 0) {
		return (
			<div
				className="w-full flex items-center justify-center text-muted-foreground text-xs"
				style={{ height: `${height}px` }}
			>
				No data
			</div>
		);
	}

	const width = 100;
	const values = data.map((d) => d.value);
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);
	const range = maxValue - minValue || 1; // Avoid division by zero

	// Normalize values to 0-1 range
	const normalizedData = data.map((d, i) => ({
		x: (i / Math.max(data.length - 1, 1)) * width,
		y: height - ((d.value - minValue) / range) * height,
	}));

	// Create SVG path
	const points = normalizedData.map((d) => `${d.x.toFixed(2)},${d.y.toFixed(2)}`);
	const pathD = `M ${points.join(" L ")}`;
	const areaD = `M 0,${height} L ${points.join(" L ")} L ${width},${height} Z`;

	return (
		<div className="h-full w-full relative">
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="w-full h-full"
				preserveAspectRatio="none"
			>
				{/* Gradient for area fill */}
				{showArea && (
					<defs>
						<linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" stopColor={color} stopOpacity="0.3" />
							<stop offset="100%" stopColor={color} stopOpacity="0.05" />
						</linearGradient>
					</defs>
				)}

				{/* Area fill */}
				{showArea && (
					<path
						d={areaD}
						fill={`url(#gradient-${color})`}
					/>
				)}

				{/* Line path */}
				<path
					d={pathD}
					stroke={color}
					strokeWidth="2"
					fill="none"
					opacity="0.8"
				/>

				{/* Dots at data points */}
				{showDots &&
					normalizedData.map((d, i) => (
						<circle
							key={i}
							cx={d.x}
							cy={d.y}
							r="1.5"
							fill={color}
							opacity="0.9"
						/>
					))}
			</svg>
		</div>
	);
}
