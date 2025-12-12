import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
	try {
		const { linkId } = await request.json();

		if (!linkId) {
			return NextResponse.json({ error: "Link ID required" }, { status: 400 });
		}

		// Fetch the link
		const links = await db
			.select()
			.from(advancedLinks)
			.where(eq(advancedLinks.id, linkId))
			.limit(1);

		if (links.length === 0) {
			return NextResponse.json({ error: "Link not found" }, { status: 404 });
		}

		const link = links[0];

		// Check if destination URL is valid
		let isHealthy = true;
		let statusCode = 0;
		let errorMessage: string | null = null;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

			const response = await fetch(link.destination, {
				method: "HEAD",
				signal: controller.signal,
				redirect: "follow",
			});

			clearTimeout(timeoutId);
			statusCode = response.status;
			isHealthy = response.ok; // 200-299 range
		} catch (error) {
			isHealthy = false;
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					errorMessage = "Request timeout";
				} else {
					errorMessage = error.message;
				}
			} else {
				errorMessage = "Unknown error";
			}
		}

		// Update link with health check result
		const now = new Date();
		await db
			.update(advancedLinks)
			.set({
				lastHealthCheck: now,
				isHealthy,
			})
			.where(eq(advancedLinks.id, linkId));

		return NextResponse.json({
			linkId,
			isHealthy,
			statusCode,
			errorMessage,
			checkedAt: now.toISOString(),
		});
	} catch (error) {
		console.error("[/api/links/health-check] Error:", error);
		return NextResponse.json(
			{ error: "Failed to check link health" },
			{ status: 500 }
		);
	}
}

// Batch health check endpoint
export async function GET(request: NextRequest) {
	try {
		// Get all links (we'll filter in memory for simplicity)
		const allLinks = await db
			.select()
			.from(advancedLinks)
			.limit(100);

		// Filter to links that haven't been checked in the last 24 hours
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		const linksToCheck = allLinks
			.filter(link => !link.lastHealthCheck || link.lastHealthCheck < oneDayAgo)
			.slice(0, 50); // Limit to 50 links per batch

		const results = [];

		for (const link of linksToCheck) {
			let isHealthy = true;
			let statusCode = 0;

			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 5000);

				const response = await fetch(link.destination, {
					method: "HEAD",
					signal: controller.signal,
					redirect: "follow",
				});

				clearTimeout(timeoutId);
				statusCode = response.status;
				isHealthy = response.ok;
			} catch (error) {
				isHealthy = false;
			}

			// Update link
			await db
				.update(advancedLinks)
				.set({
					lastHealthCheck: new Date(),
					isHealthy,
				})
				.where(eq(advancedLinks.id, link.id));

			results.push({
				linkId: link.id,
				name: link.name,
				isHealthy,
				statusCode,
			});
		}

		return NextResponse.json({
			checked: results.length,
			results,
		});
	} catch (error) {
		console.error("[/api/links/health-check] Batch check error:", error);
		return NextResponse.json(
			{ error: "Failed to run batch health check" },
			{ status: 500 }
		);
	}
}
