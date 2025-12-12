import React, { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface FrostedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export const FrostedButton = forwardRef<HTMLButtonElement, FrostedButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			isLoading = false,
			leftIcon,
			rightIcon,
			children,
			className = "",
			disabled,
			...props
		},
		ref
	) => {
		const baseClasses = [
			"inline-flex items-center justify-center gap-2",
			"font-medium",
			"rounded-xl",
			"transition-all duration-200",
			"focus:outline-none focus:ring-2 focus:ring-offset-2",
			"disabled:opacity-50 disabled:cursor-not-allowed",
		];

		const sizeClasses = {
			sm: "h-9 px-3 py-2 text-xs",
			md: "h-10 px-4 py-2.5 text-sm",
			lg: "h-12 px-6 py-3 text-base",
		};

		const variantClasses = {
			primary: [
				"bg-black dark:bg-white",
				"text-white dark:text-black",
				"hover:bg-black/90 dark:hover:bg-white/90",
				"focus:ring-black/20 dark:focus:ring-white/20",
				"shadow-lg",
			],
			secondary: [
				"bg-white/10 dark:bg-black/10",
				"backdrop-blur-xl",
				"border border-white/20 dark:border-white/10",
				"text-foreground",
				"hover:bg-white/20 dark:hover:bg-white/[0.15]",
				"focus:ring-white/10",
			],
			ghost: [
				"bg-transparent",
				"text-foreground",
				"hover:bg-white/10 dark:hover:bg-white/[0.05]",
				"focus:ring-white/10",
			],
			danger: [
				"bg-red-500/10",
				"backdrop-blur-xl",
				"border border-red-400/30",
				"text-red-400",
				"hover:bg-red-500/20",
				"focus:ring-red-400/20",
			],
		};

		const allClasses = [
			...baseClasses,
			sizeClasses[size],
			...variantClasses[variant],
			className,
		]
			.filter(Boolean)
			.join(" ");

		return (
			<button
				ref={ref}
				className={allClasses}
				disabled={disabled || isLoading}
				{...props}
			>
				{isLoading ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="opacity-0">{children}</span>
					</>
				) : (
					<>
						{leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
						{children}
						{rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
					</>
				)}
			</button>
		);
	}
);

FrostedButton.displayName = "FrostedButton";
