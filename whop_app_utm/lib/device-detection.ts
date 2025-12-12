import UAParser from "ua-parser-js";

export type DeviceInfo = {
	deviceType: "mobile" | "tablet" | "desktop";
	browser: string;
	os: string;
};

/**
 * Parse user agent string to extract device type, browser, and OS
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
	const parser = new UAParser(userAgent);
	const result = parser.getResult();

	// Determine device type
	let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
	if (result.device.type === "mobile") {
		deviceType = "mobile";
	} else if (result.device.type === "tablet") {
		deviceType = "tablet";
	}

	// Get browser name (fallback to "Other" if unknown)
	const browser = result.browser.name || "Other";

	// Get OS name (fallback to "Other" if unknown)
	const os = result.os.name || "Other";

	return {
		deviceType,
		browser,
		os,
	};
}

/**
 * Get country code from IP address using ipapi.co
 * Returns null if the API fails or IP is invalid
 */
export async function getCountryFromIP(ip: string): Promise<string | null> {
	// Skip for localhost/private IPs
	if (
		ip === "unknown" ||
		ip === "127.0.0.1" ||
		ip === "::1" ||
		ip.startsWith("192.168.") ||
		ip.startsWith("10.") ||
		ip.startsWith("172.")
	) {
		return null;
	}

	try {
		// Use ipapi.co free tier (1000 requests/day, no API key needed)
		const response = await fetch(`https://ipapi.co/${ip}/country_code/`, {
			headers: {
				"User-Agent": "whop-utm-tracker/1.0",
			},
			// Add timeout to prevent hanging
			signal: AbortSignal.timeout(2000),
		});

		if (!response.ok) {
			console.warn(`[getCountryFromIP] API returned ${response.status} for IP ${ip}`);
			return null;
		}

		const countryCode = await response.text();

		// Validate it's a 2-letter code
		if (countryCode && /^[A-Z]{2}$/.test(countryCode.trim())) {
			return countryCode.trim();
		}

		return null;
	} catch (error) {
		// Silently fail - we don't want to block redirects if geolocation fails
		console.warn(`[getCountryFromIP] Failed for IP ${ip}:`, error);
		return null;
	}
}
