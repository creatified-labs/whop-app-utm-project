"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, ExternalLink, Tag } from "lucide-react";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	link: {
		name: string;
		slug: string;
		destination: string;
		utmSource?: string | null;
		utmMedium?: string | null;
		utmCampaign?: string | null;
	};
};

export function LinkPreviewModal({ isOpen, onClose, link }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const trackingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/t/${link.slug}`;

	useEffect(() => {
		if (isOpen && canvasRef.current) {
			generateQRCode();
		}
	}, [isOpen, trackingUrl]);

	const generateQRCode = async () => {
		if (!canvasRef.current) return;

		try {
			await QRCode.toCanvas(canvasRef.current, trackingUrl, {
				width: 200,
				margin: 2,
				color: {
					dark: "#000000",
					light: "#FFFFFF",
				},
			});
		} catch (err) {
			console.error("[LinkPreviewModal] Failed to generate QR code:", err);
		}
	};

	const buildFinalUrl = () => {
		const url = new URL(link.destination);
		if (link.utmSource) url.searchParams.set("utm_source", link.utmSource);
		if (link.utmMedium) url.searchParams.set("utm_medium", link.utmMedium);
		if (link.utmCampaign) url.searchParams.set("utm_campaign", link.utmCampaign);
		return url.toString();
	};

	const finalUrl = buildFinalUrl();

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="mx-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#121212] shadow-xl p-6">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-lg font-semibold text-foreground">Link Preview</h2>
						<p className="text-xs text-muted-foreground mt-1">{link.name}</p>
					</div>
					<button
						onClick={onClose}
						className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
					>
						<X className="h-4 w-4 text-muted-foreground" />
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Details */}
					<div className="lg:col-span-2 space-y-4">
						{/* Tracking URL */}
						<div className="bg-white/5 rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<ExternalLink className="h-4 w-4 text-blue-500" />
								<h3 className="text-sm font-medium text-foreground">Tracking URL</h3>
							</div>
							<div className="bg-black/20 rounded p-2">
								<p className="text-xs font-mono text-foreground break-all">{trackingUrl}</p>
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								This is the short link you'll share. It tracks clicks and redirects to your destination.
							</p>
						</div>

						{/* Destination */}
						<div className="bg-white/5 rounded-lg p-4">
							<div className="flex items-center gap-2 mb-2">
								<ExternalLink className="h-4 w-4 text-green-500" />
								<h3 className="text-sm font-medium text-foreground">Final Destination</h3>
							</div>
							<div className="bg-black/20 rounded p-2">
								<p className="text-xs font-mono text-foreground break-all">{finalUrl}</p>
							</div>
							<p className="text-xs text-muted-foreground mt-2">
								Users will be redirected here with UTM parameters appended.
							</p>
						</div>

						{/* UTM Parameters */}
						<div className="bg-white/5 rounded-lg p-4">
							<div className="flex items-center gap-2 mb-3">
								<Tag className="h-4 w-4 text-purple-500" />
								<h3 className="text-sm font-medium text-foreground">UTM Parameters</h3>
							</div>
							<div className="space-y-2">
								{link.utmSource && (
									<div className="flex items-center justify-between py-2 border-b border-white/10">
										<span className="text-xs text-muted-foreground">utm_source</span>
										<span className="text-xs font-medium text-foreground">{link.utmSource}</span>
									</div>
								)}
								{link.utmMedium && (
									<div className="flex items-center justify-between py-2 border-b border-white/10">
										<span className="text-xs text-muted-foreground">utm_medium</span>
										<span className="text-xs font-medium text-foreground">{link.utmMedium}</span>
									</div>
								)}
								{link.utmCampaign && (
									<div className="flex items-center justify-between py-2 border-b border-white/10">
										<span className="text-xs text-muted-foreground">utm_campaign</span>
										<span className="text-xs font-medium text-foreground">{link.utmCampaign}</span>
									</div>
								)}
								{!link.utmSource && !link.utmMedium && !link.utmCampaign && (
									<p className="text-xs text-muted-foreground">No UTM parameters configured</p>
								)}
							</div>
						</div>

						{/* Click Flow */}
						<div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg p-4 border border-blue-500/20">
							<h3 className="text-sm font-medium text-foreground mb-3">Click Flow</h3>
							<div className="flex items-center gap-2 text-xs">
								<div className="flex-1 bg-blue-500/20 rounded p-2 text-center">
									<p className="font-medium text-blue-300">User Clicks</p>
									<p className="text-blue-400 mt-1">/t/{link.slug}</p>
								</div>
								<span className="text-muted-foreground">→</span>
								<div className="flex-1 bg-purple-500/20 rounded p-2 text-center">
									<p className="font-medium text-purple-300">Tracked</p>
									<p className="text-purple-400 mt-1">Session Created</p>
								</div>
								<span className="text-muted-foreground">→</span>
								<div className="flex-1 bg-green-500/20 rounded p-2 text-center">
									<p className="font-medium text-green-300">Redirected</p>
									<p className="text-green-400 mt-1">With UTMs</p>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - QR Code */}
					<div className="space-y-4">
						<div className="bg-white/5 rounded-lg p-4">
							<h3 className="text-sm font-medium text-foreground mb-3 text-center">QR Code</h3>
							<div className="bg-white p-3 rounded-lg flex justify-center">
								<canvas ref={canvasRef} />
							</div>
							<p className="text-xs text-muted-foreground text-center mt-3">
								Scan to test the link on mobile
							</p>
						</div>

						<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
							<h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
								Testing Tips
							</h3>
							<ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
								<li>• Scan QR code with your phone</li>
								<li>• Check if redirect works</li>
								<li>• Verify UTM params in URL</li>
								<li>• Test on different devices</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-2 mt-6 pt-6 border-t border-white/10">
					<a
						href={trackingUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
					>
						<ExternalLink className="h-4 w-4" />
						Test Link
					</a>
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 text-foreground hover:bg-white/10 transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
