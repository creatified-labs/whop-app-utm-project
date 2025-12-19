"use client";

interface InlineFilterProps {
	type?: "pills" | "dropdown";
	options: string[];
	value: string;
	onChange: (value: string) => void;
	label?: string;
}

export function InlineFilter({
	type = "pills",
	options,
	value,
	onChange,
	label,
}: InlineFilterProps) {
	if (type === "pills") {
		return (
			<div className="flex items-center gap-1">
				{label && (
					<span className="text-[10px] text-muted-foreground mr-1">
						{label}
					</span>
				)}
				{options.map((option) => (
					<button
						key={option}
						type="button"
						onClick={() => onChange(option)}
						className={`px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors ${
							value === option
								? "bg-blue-500 text-white"
								: "bg-white/5 text-muted-foreground hover:bg-white/10"
						}`}
					>
						{option}
					</button>
				))}
			</div>
		);
	}

	// Dropdown version
	return (
		<div className="flex items-center gap-1.5">
			{label && (
				<span className="text-[10px] text-muted-foreground">{label}</span>
			)}
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="px-2 py-1 text-[10px] font-medium bg-white/5 text-foreground border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}
