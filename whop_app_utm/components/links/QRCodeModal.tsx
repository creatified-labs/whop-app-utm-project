"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Download } from "lucide-react";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	url: string;
	linkName: string;
};

export function QRCodeModal({ isOpen, onClose, url, linkName }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen && canvasRef.current) {
			generateQRCode();
		}
	}, [isOpen, url]);

	const generateQRCode = async () => {
		if (!canvasRef.current) return;

		try {
			setError(null);
			await QRCode.toCanvas(canvasRef.current, url, {
				width: 300,
				margin: 2,
				color: {
					dark: "#000000",
					light: "#FFFFFF",
				},
			});
		} catch (err) {
			console.error("[QRCodeModal] Failed to generate QR code:", err);
			setError("Failed to generate QR code");
		}
	};

	const handleDownload = () => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const link = document.createElement("a");
		link.download = `qr-${linkName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
		link.href = canvas.toDataURL("image/png");
		link.click();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="mx-4 w-full max-w-md rounded-2xl bg-white dark:bg-[#121212] shadow-xl p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-lg font-semibold text-foreground">QR Code</h2>
						<p className="text-xs text-muted-foreground mt-1">{linkName}</p>
					</div>
					<button
						onClick={onClose}
						className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
					>
						<X className="h-4 w-4 text-muted-foreground" />
					</button>
				</div>

				<div className="flex flex-col items-center gap-4">
					{error ? (
						<div className="w-[300px] h-[300px] flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg">
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					) : (
						<div className="bg-white p-4 rounded-lg">
							<canvas ref={canvasRef} />
						</div>
					)}

					<div className="w-full bg-white/5 rounded-lg p-3">
						<p className="text-xs text-muted-foreground mb-1">Tracking URL:</p>
						<p className="text-xs text-foreground font-mono break-all">{url}</p>
					</div>

					<div className="flex gap-2 w-full">
						<button
							onClick={handleDownload}
							disabled={!!error}
							className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
						>
							<Download className="h-4 w-4" />
							Download PNG
						</button>
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-foreground hover:bg-white/10 transition-colors"
						>
							Close
						</button>
					</div>
				</div>

				<div className="mt-4 pt-4 border-t border-white/10">
					<p className="text-xs text-muted-foreground text-center">
						Scan this QR code with a mobile device to test your tracking link
					</p>
				</div>
			</div>
		</div>
	);
}
