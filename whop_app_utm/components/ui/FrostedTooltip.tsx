"use client";

import React, { useState, useRef, useEffect } from "react";

export interface FrostedTooltipProps {
	content: string | React.ReactNode;
	children: React.ReactNode;
	position?: "top" | "bottom" | "left" | "right";
	delay?: number;
}

export function FrostedTooltip({
	content,
	children,
	position = "top",
	delay = 200,
}: FrostedTooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState({ x: 0, y: 0 });
	const timeoutRef = useRef<NodeJS.Timeout>();
	const triggerRef = useRef<HTMLDivElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	const handleMouseEnter = () => {
		timeoutRef.current = setTimeout(() => {
			if (triggerRef.current) {
				const rect = triggerRef.current.getBoundingClientRect();
				const tooltipHeight = tooltipRef.current?.offsetHeight || 0;
				const tooltipWidth = tooltipRef.current?.offsetWidth || 0;

				let x = 0;
				let y = 0;

				switch (position) {
					case "top":
						x = rect.left + rect.width / 2 - tooltipWidth / 2;
						y = rect.top - tooltipHeight - 8;
						break;
					case "bottom":
						x = rect.left + rect.width / 2 - tooltipWidth / 2;
						y = rect.bottom + 8;
						break;
					case "left":
						x = rect.left - tooltipWidth - 8;
						y = rect.top + rect.height / 2 - tooltipHeight / 2;
						break;
					case "right":
						x = rect.right + 8;
						y = rect.top + rect.height / 2 - tooltipHeight / 2;
						break;
				}

				setCoords({ x, y });
				setIsVisible(true);
			}
		}, delay);
	};

	const handleMouseLeave = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setIsVisible(false);
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<>
			<div
				ref={triggerRef}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className="inline-block"
			>
				{children}
			</div>

			{isVisible && (
				<div
					ref={tooltipRef}
					className={[
						"fixed z-50 pointer-events-none",
						"px-3 py-2 rounded-lg",
						"bg-white/95 dark:bg-black/95",
						"backdrop-blur-md",
						"border border-white/20 dark:border-white/10",
						"shadow-lg",
						"text-xs text-foreground",
						"max-w-xs",
						"transition-opacity duration-200",
						"animate-in fade-in",
					].join(" ")}
					style={{
						left: `${coords.x}px`,
						top: `${coords.y}px`,
					}}
				>
					{content}
				</div>
			)}
		</>
	);
}
