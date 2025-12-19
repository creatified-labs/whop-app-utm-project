"use client";

import { useState, useEffect, useRef } from "react";
import { FrostedInput } from "./FrostedInput";

type UTMAutocompleteProps = {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	field: "source" | "medium" | "campaign";
	className?: string;
};

export function UTMAutocomplete({
	label,
	value,
	onChange,
	placeholder,
	field,
	className,
}: UTMAutocompleteProps) {
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Fetch suggestions on mount
	useEffect(() => {
		async function fetchSuggestions() {
			try {
				const res = await fetch(`/api/utm-suggestions?field=${field}`);
				if (res.ok) {
					const data = await res.json();
					setSuggestions(data.suggestions || []);
				}
			} catch (error) {
				console.error(`[UTMAutocomplete] Failed to fetch ${field} suggestions:`, error);
			}
		}

		fetchSuggestions();
	}, [field]);

	// Filter suggestions based on input value
	useEffect(() => {
		if (!value.trim()) {
			setFilteredSuggestions(suggestions.slice(0, 10));
		} else {
			const filtered = suggestions.filter((s) =>
				s.toLowerCase().includes(value.toLowerCase())
			);
			setFilteredSuggestions(filtered.slice(0, 10));
		}
		setHighlightedIndex(-1);
	}, [value, suggestions]);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setShowSuggestions(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
		setShowSuggestions(true);
	};

	const handleInputFocus = () => {
		if (suggestions.length > 0) {
			setShowSuggestions(true);
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		onChange(suggestion);
		setShowSuggestions(false);
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!showSuggestions || filteredSuggestions.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prev) =>
					prev < filteredSuggestions.length - 1 ? prev + 1 : prev
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;
			case "Enter":
				e.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
					handleSuggestionClick(filteredSuggestions[highlightedIndex]);
				}
				break;
			case "Escape":
				setShowSuggestions(false);
				break;
		}
	};

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="block text-sm font-medium text-foreground mb-1">
					{label}
				</label>
			)}
			<div ref={wrapperRef} className="relative">
				<FrostedInput
					ref={inputRef}
					type="text"
					value={value}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className={className}
					autoComplete="off"
				/>

				{showSuggestions && filteredSuggestions.length > 0 && (
					<div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-[0_15px_45px_rgba(15,23,42,0.25)] backdrop-blur-2xl">
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-white/20 to-transparent dark:from-white/15 dark:via-white/5 dark:to-transparent" />
						<div className="relative py-1">
							{filteredSuggestions.map((suggestion, index) => (
								<button
									key={suggestion}
									type="button"
									onClick={() => handleSuggestionClick(suggestion)}
									className={`w-full text-left px-3 py-2 text-[11px] transition-colors ${index === highlightedIndex
										? "bg-blue-500/20 text-foreground"
										: "text-foreground hover:bg-white/10 dark:hover:bg-white/5"
										}`}
									onMouseEnter={() => setHighlightedIndex(index)}
								>
									<div className="flex items-center justify-between">
										<span className="font-medium">{suggestion}</span>
										<span className="text-[9px] text-muted-foreground">
											Previously used
										</span>
									</div>
								</button>
							))}
						</div>
						<div className="relative border-t border-white/30 dark:border-white/10 px-3 py-2 text-[9px] text-muted-foreground">
							Type to add a new value or select from existing
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
