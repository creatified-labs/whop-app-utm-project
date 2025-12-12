"use client";

import { useState } from "react";
import { X, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onImport: (links: ImportedLink[]) => Promise<ImportResult>;
};

export type ImportedLink = {
	name: string;
	destination: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
};

export type ImportResult = {
	created: number;
	failed: number;
	errors: string[];
};

export function BulkImportModal({ isOpen, onClose, onImport }: Props) {
	const [file, setFile] = useState<File | null>(null);
	const [importing, setImporting] = useState(false);
	const [result, setResult] = useState<ImportResult | null>(null);
	const [parseError, setParseError] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			setParseError(null);
			setResult(null);
		}
	};

	const parseCSV = (text: string): ImportedLink[] => {
		const lines = text.split("\n").filter((line) => line.trim());
		if (lines.length === 0) {
			throw new Error("CSV file is empty");
		}

		const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
		const nameIndex = headers.indexOf("name");
		const destIndex = headers.indexOf("destination");
		const sourceIndex = headers.indexOf("utm_source");
		const mediumIndex = headers.indexOf("utm_medium");
		const campaignIndex = headers.indexOf("utm_campaign");

		if (nameIndex === -1 || destIndex === -1) {
			throw new Error("CSV must have 'name' and 'destination' columns");
		}

		const links: ImportedLink[] = [];
		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(",").map((v) => v.trim());
			if (values.length < 2) continue;

			links.push({
				name: values[nameIndex] || "",
				destination: values[destIndex] || "",
				utmSource: sourceIndex !== -1 ? values[sourceIndex] : undefined,
				utmMedium: mediumIndex !== -1 ? values[mediumIndex] : undefined,
				utmCampaign: campaignIndex !== -1 ? values[campaignIndex] : undefined,
			});
		}

		return links;
	};

	const handleImport = async () => {
		if (!file) return;

		setImporting(true);
		setParseError(null);
		setResult(null);

		try {
			const text = await file.text();
			const links = parseCSV(text);

			if (links.length === 0) {
				setParseError("No valid links found in CSV");
				setImporting(false);
				return;
			}

			const importResult = await onImport(links);
			setResult(importResult);
		} catch (error) {
			console.error("[BulkImportModal] Import failed:", error);
			setParseError(error instanceof Error ? error.message : "Failed to import CSV");
		} finally {
			setImporting(false);
		}
	};

	const handleClose = () => {
		setFile(null);
		setResult(null);
		setParseError(null);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="mx-4 w-full max-w-2xl rounded-2xl bg-white dark:bg-[#121212] shadow-xl p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-lg font-semibold text-foreground">Bulk Import Links</h2>
						<p className="text-xs text-muted-foreground mt-1">
							Import multiple links from a CSV file
						</p>
					</div>
					<button
						onClick={handleClose}
						className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
					>
						<X className="h-4 w-4 text-muted-foreground" />
					</button>
				</div>

				<div className="space-y-4">
					{/* CSV Format Instructions */}
					<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
						<h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
							CSV Format
						</h3>
						<p className="text-xs text-blue-800 dark:text-blue-400 mb-2">
							Your CSV file should have the following columns:
						</p>
						<code className="block text-xs bg-white dark:bg-black/20 p-2 rounded font-mono">
							name,destination,utm_source,utm_medium,utm_campaign
						</code>
						<p className="text-xs text-blue-800 dark:text-blue-400 mt-2">
							<strong>Required:</strong> name, destination<br />
							<strong>Optional:</strong> utm_source, utm_medium, utm_campaign
						</p>
					</div>

					{/* File Upload */}
					<div className="border-2 border-dashed border-white/20 rounded-lg p-6">
						<div className="flex flex-col items-center gap-3">
							<Upload className="h-10 w-10 text-muted-foreground" />
							<div className="text-center">
								<label
									htmlFor="csv-upload"
									className="cursor-pointer text-sm font-medium text-blue-500 hover:text-blue-600"
								>
									Choose CSV file
								</label>
								<input
									id="csv-upload"
									type="file"
									accept=".csv"
									onChange={handleFileChange}
									className="hidden"
								/>
								<p className="text-xs text-muted-foreground mt-1">
									{file ? file.name : "or drag and drop"}
								</p>
							</div>
						</div>
					</div>

					{/* Parse Error */}
					{parseError && (
						<div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 flex items-start gap-3">
							<XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
							<div>
								<h3 className="text-sm font-medium text-red-900 dark:text-red-300">
									Import Error
								</h3>
								<p className="text-xs text-red-800 dark:text-red-400 mt-1">{parseError}</p>
							</div>
						</div>
					)}

					{/* Import Result */}
					{result && (
						<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
								<div className="flex-1">
									<h3 className="text-sm font-medium text-green-900 dark:text-green-300">
										Import Complete
									</h3>
									<div className="mt-2 space-y-1">
										<p className="text-xs text-green-800 dark:text-green-400">
											✓ {result.created} link{result.created !== 1 ? "s" : ""} created successfully
										</p>
										{result.failed > 0 && (
											<p className="text-xs text-red-800 dark:text-red-400">
												✗ {result.failed} link{result.failed !== 1 ? "s" : ""} failed
											</p>
										)}
									</div>
									{result.errors.length > 0 && (
										<div className="mt-3">
											<p className="text-xs font-medium text-green-900 dark:text-green-300 mb-1">
												Errors:
											</p>
											<ul className="text-xs text-green-800 dark:text-green-400 space-y-1">
												{result.errors.slice(0, 5).map((error, i) => (
													<li key={i}>• {error}</li>
												))}
												{result.errors.length > 5 && (
													<li>• ... and {result.errors.length - 5} more</li>
												)}
											</ul>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Actions */}
					<div className="flex gap-2">
						<button
							onClick={handleImport}
							disabled={!file || importing}
							className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
						>
							{importing ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Importing...
								</>
							) : (
								<>
									<Upload className="h-4 w-4" />
									Import Links
								</>
							)}
						</button>
						<button
							onClick={handleClose}
							className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-foreground hover:bg-white/10 transition-colors"
						>
							{result ? "Done" : "Cancel"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
