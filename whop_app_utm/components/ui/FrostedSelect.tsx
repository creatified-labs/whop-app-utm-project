import React, { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export interface FrostedSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	variant?: "default" | "error" | "success";
	label?: string;
	helperText?: string;
	options?: Array<{ value: string; label: string }>;
}

export const FrostedSelect = forwardRef<HTMLSelectElement, FrostedSelectProps>(
	(
		{
			className = "",
			variant = "default",
			label,
			helperText,
			disabled,
			options = [],
			children,
			...props
		},
		ref
	) => {
		const baseClasses = [
			"w-full px-4 py-2.5 pr-10 text-sm",
			"bg-white/5 dark:bg-black/5",
			"backdrop-blur-xl",
			"border rounded-xl",
			"text-foreground",
			"appearance-none cursor-pointer",
			"transition-all duration-200",
			"focus:outline-none",
			"disabled:opacity-50 disabled:cursor-not-allowed",
		];

		const variantClasses = {
			default: [
				"border-white/10 dark:border-white/5",
				"focus:border-white/30 focus:ring-2 focus:ring-white/10",
			],
			error: [
				"border-red-400/30",
				"focus:border-red-400/50 focus:ring-2 focus:ring-red-400/20",
				"shadow-[0_0_12px_rgba(248,113,113,0.15)]",
			],
			success: [
				"border-green-400/30",
				"focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20",
				"shadow-[0_0_12px_rgba(74,222,128,0.15)]",
			],
		};

		const allClasses = [
			...baseClasses,
			...variantClasses[variant],
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<div className="w-full">
				{label && (
					<label className="block text-sm font-medium text-foreground mb-2">
						{label}
					</label>
				)}
				<div className="relative">
					<select
						ref={ref}
						className={allClasses}
						disabled={disabled}
						{...props}
					>
						{children ||
							options.map((option) => (
								<option
									key={option.value}
									value={option.value}
									className="bg-[#1a1a1a] text-foreground"
								>
									{option.label}
								</option>
							))}
					</select>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
						<ChevronDown className="h-4 w-4 text-muted-foreground" />
					</div>
				</div>
				{helperText && (
					<p
						className={[
							"mt-1.5 text-xs",
							variant === "error"
								? "text-red-400"
								: variant === "success"
									? "text-green-400"
									: "text-muted-foreground",
						].join(" ")}
					>
						{helperText}
					</p>
				)}
			</div>
		);
	}
);

FrostedSelect.displayName = "FrostedSelect";
