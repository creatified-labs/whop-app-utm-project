"use client";

import React, { useEffect, useState } from "react";
import { X, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface FrostedToastProps {
	variant?: ToastVariant;
	title: string;
	message?: string;
	duration?: number;
	onClose?: () => void;
	action?: {
		label: string;
		onClick: () => void;
	};
}

const variantConfig = {
	success: {
		icon: CheckCircle,
		borderColor: "border-green-400/30",
		iconColor: "text-green-400",
		bgAccent: "bg-green-500/10",
	},
	error: {
		icon: XCircle,
		borderColor: "border-red-400/30",
		iconColor: "text-red-400",
		bgAccent: "bg-red-500/10",
	},
	info: {
		icon: Info,
		borderColor: "border-blue-400/30",
		iconColor: "text-blue-400",
		bgAccent: "bg-blue-500/10",
	},
	warning: {
		icon: AlertTriangle,
		borderColor: "border-yellow-400/30",
		iconColor: "text-yellow-400",
		bgAccent: "bg-yellow-500/10",
	},
};

export function FrostedToast({
	variant = "info",
	title,
	message,
	duration = 5000,
	onClose,
	action,
}: FrostedToastProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isExiting, setIsExiting] = useState(false);

	const config = variantConfig[variant];
	const Icon = config.icon;

	useEffect(() => {
		// Trigger enter animation
		requestAnimationFrame(() => {
			setIsVisible(true);
		});

		// Auto-dismiss
		if (duration > 0) {
			const timer = setTimeout(() => {
				handleClose();
			}, duration);

			return () => clearTimeout(timer);
		}
	}, [duration]);

	const handleClose = () => {
		setIsExiting(true);
		setTimeout(() => {
			onClose?.();
		}, 300);
	};

	return (
		<div
			className={[
				"fixed bottom-6 right-6 z-50",
				"w-full max-w-sm",
				"transform transition-all duration-300 ease-out",
				isVisible && !isExiting
					? "translate-y-0 opacity-100"
					: "translate-y-4 opacity-0",
			].join(" ")}
		>
			<div
				className={[
					"rounded-2xl",
					"bg-white/90 dark:bg-black/90",
					"backdrop-blur-xl",
					"border",
					config.borderColor,
					"shadow-2xl",
					"p-4",
					"flex items-start gap-3",
				].join(" ")}
			>
				{/* Icon */}
				<div className={["p-2 rounded-lg", config.bgAccent].join(" ")}>
					<Icon className={["h-5 w-5", config.iconColor].join(" ")} />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<h3 className="text-sm font-semibold text-foreground">{title}</h3>
					{message && (
						<p className="mt-1 text-xs text-muted-foreground">{message}</p>
					)}
					{action && (
						<button
							onClick={action.onClick}
							className="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
						>
							{action.label}
						</button>
					)}
				</div>

				{/* Close button */}
				<button
					onClick={handleClose}
					className="p-1 rounded-lg hover:bg-white/10 transition-colors"
				>
					<X className="h-4 w-4 text-muted-foreground" />
				</button>
			</div>
		</div>
	);
}

// Toast container for managing multiple toasts
export interface Toast {
	id: string;
	variant: ToastVariant;
	title: string;
	message?: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function FrostedToastContainer({ toasts }: { toasts: Toast[] }) {
	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
			{toasts.map((toast, index) => (
				<div
					key={toast.id}
					className="pointer-events-auto"
					style={{
						transform: `translateY(-${index * 8}px)`,
					}}
				>
					<FrostedToast {...toast} />
				</div>
			))}
		</div>
	);
}
