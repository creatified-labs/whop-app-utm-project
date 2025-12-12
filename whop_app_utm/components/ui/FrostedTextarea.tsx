import React, { forwardRef, TextareaHTMLAttributes } from "react";

export interface FrostedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	variant?: "default" | "error" | "success";
	label?: string;
	helperText?: string;
}

export const FrostedTextarea = forwardRef<HTMLTextAreaElement, FrostedTextareaProps>(
	(
		{
			className = "",
			variant = "default",
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
			"resize-none",
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
				<textarea
					ref={ref}
					className={allClasses}
					disabled={disabled}
					{...props}
				/>
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

FrostedTextarea.displayName = "FrostedTextarea";
