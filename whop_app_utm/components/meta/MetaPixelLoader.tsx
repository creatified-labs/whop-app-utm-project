"use client";

import { useEffect } from "react";

interface MetaPixelLoaderProps {
	companyId: string;
}

declare global {
	// eslint-disable-next-line no-unused-vars
	interface Window {
		fbq?: (...args: any[]) => void;
		_fbq?: any;
	}
}

function trackFbq(...args: any[]) {
	if (typeof window === "undefined") return;
	const fbq = (window as Window).fbq as ((...inner: any[]) => void) | undefined;
	if (typeof fbq === "function") {
		fbq(...args);
	}
}

export function trackMetaEvent(eventName: string, params?: Record<string, any>) {
	if (params) {
		trackFbq("track", eventName, params);
	} else {
		trackFbq("track", eventName);
	}
}

function initMetaPixel(pixelId: string) {
	if (typeof window === "undefined") return;
	if (window.fbq) {
		// Already initialized for this page load
		return;
	}

	// Lightweight adaptation of the standard Meta Pixel snippet
	(function (f: any, b: Document, e: string, v: string) {
		if (f.fbq) return;
		const n: any = function () {
			// eslint-disable-next-line prefer-rest-params
			n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
		};
		f.fbq = n;
		if (!f._fbq) f._fbq = n;
		n.push = n;
		n.loaded = true;
		n.version = "2.0";
		n.queue = [];
		const t = b.createElement(e) as HTMLScriptElement;
		t.async = true;
		t.src = v;
		const s = b.getElementsByTagName(e)[0];
		s?.parentNode?.insertBefore(t, s);
	})(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

	trackFbq("init", pixelId);
}

export function MetaPixelLoader({ companyId }: MetaPixelLoaderProps) {
	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const res = await fetch(
					`/api/meta-pixel?companyId=${encodeURIComponent(companyId)}`,
					{
						// Avoid caching so updates take effect quickly
						cache: "no-store",
					},
				);
				if (!res.ok) return;
				const data = (await res.json()) as { metaPixelId?: string | null };
				const id = data.metaPixelId?.trim();
				if (!id || cancelled) return;

				initMetaPixel(id);
				trackFbq("track", "PageView");
			} catch {
				// Fail silently; pixel is non-critical
			}
		}

		void load();

		return () => {
			cancelled = true;
		};
	}, [companyId]);

	return null;
}
