import { UAParser } from "ua-parser-js";

export type DeviceInfo = {
	deviceType: "mobile" | "tablet" | "desktop";
	browser: string;
	browserVersion: string;
	os: string;
	osVersion: string;
};

export type GeoInfo = {
	countryCode: string | null;
	countryName: string | null;
	city: string | null;
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
	const browserVersion = result.browser.version || "";

	// Get OS name (fallback to "Other" if unknown)
	const os = result.os.name || "Other";
	const osVersion = result.os.version || "";

	return {
		deviceType,
		browser,
		browserVersion,
		os,
		osVersion,
	};
}

/**
 * Get detailed geo information from IP address using ipapi.co
 * Returns country code, country name, and city
 */
export async function getCountryFromIP(ip: string): Promise<string | null> {
	const geoInfo = await getGeoInfo(ip);
	return geoInfo.countryCode;
}

/**
 * Get full geo information including country code, name, and city
 */
export async function getGeoInfo(ip: string): Promise<GeoInfo> {
	// Skip for localhost/private IPs
	if (
		ip === "unknown" ||
		ip === "127.0.0.1" ||
		ip === "::1" ||
		ip.startsWith("192.168.") ||
		ip.startsWith("10.") ||
		ip.startsWith("172.")
	) {
		return { countryCode: null, countryName: null, city: null };
	}

	try {
		// Use ipapi.co free tier (1000 requests/day, no API key needed)
		const response = await fetch(`https://ipapi.co/${ip}/json/`, {
			headers: {
				"User-Agent": "whop-utm-tracker/1.0",
			},
			// Add timeout to prevent hanging
			signal: AbortSignal.timeout(2000),
		});

		if (!response.ok) {
			console.warn(`[getGeoInfo] API returned ${response.status} for IP ${ip}`);
			return { countryCode: null, countryName: null, city: null };
		}

		const data = await response.json();

		// Validate and return geo data
		return {
			countryCode: data.country_code || null,
			countryName: data.country_name || null,
			city: data.city || null,
		};
	} catch (error) {
		// Silently fail - we don't want to block redirects if geolocation fails
		console.warn(`[getGeoInfo] Failed for IP ${ip}:`, error);
		return { countryCode: null, countryName: null, city: null };
	}
}
