"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type FrostedDropdownOption = {
	value: string;
	label: string;
	group?: string | null;
	disabled?: boolean;
};

type FrostedDropdownProps = {
	label?: string;
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	options: FrostedDropdownOption[];
	className?: string;
};

export function FrostedDropdown({
	label,
	value,
	onChange,
	placeholder = "Select an option",
	options,
	className,
}: FrostedDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const wrapperRef = useRef<HTMLDivElement>(null);

	const interactiveOptions = useMemo(
		() => options.filter((opt) => !opt.disabled),
		[options],
	);

	const selectedOption = useMemo(
		() => options.find((opt) => opt.value === value),
		[value, options],
	);

	useEffect(() => {
		if (isOpen) {
			const currentIndex = interactiveOptions.findIndex((opt) => opt.value === value);
			setHighlightedIndex(currentIndex);
		}
	}, [isOpen, value, interactiveOptions]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const groupedOptions = useMemo(() => {
		const map = new Map<string | undefined, FrostedDropdownOption[]>();
		for (const option of options) {
			const key = option.group ?? undefined;
			if (!map.has(key)) {
				map.set(key, []);
			}
			map.get(key)!.push(option);
		}
		return Array.from(map.entries());
	}, [options]);

	const handleSelect = (option: FrostedDropdownOption) => {
		if (option.disabled) return;
		onChange?.(option.value);
		setIsOpen(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ")) {
			event.preventDefault();
			setIsOpen(true);
			return;
		}

		if (!isOpen) return;

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				setHighlightedIndex((prev) => {
					const next = Math.min(interactiveOptions.length - 1, prev + 1);
					return next;
				});
				break;
			case "ArrowUp":
				event.preventDefault();
				setHighlightedIndex((prev) => Math.max(0, prev - 1));
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < interactiveOptions.length) {
					handleSelect(interactiveOptions[highlightedIndex]);
				}
				break;
			case "Escape":
				setIsOpen(false);
				break;
		}
	};

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300">
					{label}
				</label>
			)}
			<div ref={wrapperRef} className="relative">
				<button
					type="button"
					onClick={() => setIsOpen((prev) => !prev)}
					onKeyDown={handleKeyDown}
					className={`w-full text-left px-4 py-2.5 text-[11px] rounded-2xl border border-white/15 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 flex items-center justify-between ${className ?? ""}`.trim()}
				>
					<span className={selectedOption ? "" : "text-gray-500 dark:text-gray-400"}>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
				</button>

				{isOpen && options.length > 0 && (
					<div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-[0_15px_45px_rgba(15,23,42,0.25)] backdrop-blur-2xl">
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-transparent dark:from-white/15 dark:via-white/5 dark:to-transparent" />
						<div className="relative max-h-60 overflow-y-auto py-1">
							{groupedOptions.map(([group, groupOptions]) => (
								<div key={group ?? "default"}>
									{group && (
										<div className="px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400">
											{group}
										</div>
									)}
									{groupOptions.map((option) => {
										const optionIndex = interactiveOptions.findIndex((opt) => opt.value === option.value);
										const isSelected = option.value === value;
										const isHighlighted = optionIndex === highlightedIndex;
										return (
											<button
												key={option.value}
												type="button"
												onClick={() => handleSelect(option)}
												className={`w-full px-3 py-2 text-left text-[11px] flex items-center justify-between transition-colors ${isHighlighted ? "bg-white/20 text-gray-900 dark:text-white" : "text-gray-900 dark:text-white"
													}`}
											>
												<span>{option.label}</span>
												{isSelected && <Check className="h-3 w-3" />}
											</button>
										);
									})}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
