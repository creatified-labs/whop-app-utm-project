import React, { forwardRef, InputHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface FrostedInputProps extends InputHTMLAttributes<HTMLInputElement> {
	variant?: "default" | "error" | "success";
	isLoading?: boolean;
	label?: string | React.ReactNode;
	helperText?: string;
}

export const FrostedInput = forwardRef<HTMLInputElement, FrostedInputProps>(
	(
		{
			className = "",
			variant = "default",
			isLoading = false,
			label,
			helperText,
			disabled,
			...props
		},
		ref
	) => {
		const baseClasses = [
			"w-full px-4 py-2.5 text-sm",
			"bg-white/5 dark:bg-black/5",
			"backdrop-blur-xl",
			"border rounded-xl",
			"text-foreground",
			"placeholder:text-white/30 dark:placeholder:text-white/20",
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

		const loadingClasses = isLoading ? "animate-pulse" : "";

		const allClasses = [
			...baseClasses,
			...variantClasses[variant],
			loadingClasses,
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
					<input
						ref={ref}
						className={allClasses}
						disabled={disabled || isLoading}
						{...props}
					/>
					{isLoading && (
						<div className="absolute right-3 top-1/2 -translate-y-1/2">
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						</div>
					)}
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

FrostedInput.displayName = "FrostedInput";
