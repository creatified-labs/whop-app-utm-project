import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinkSessions } from "@/lib/db/schema";
import { sql, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const field = searchParams.get("field");

		if (!field || !["source", "medium", "campaign"].includes(field)) {
			return NextResponse.json(
				{ error: "Invalid field parameter. Must be 'source', 'medium', or 'campaign'" },
				{ status: 400 }
			);
		}

		// Map field names to database columns
		const columnMap = {
			source: advancedLinkSessions.utmSource,
			medium: advancedLinkSessions.utmMedium,
			campaign: advancedLinkSessions.utmCampaign,
		};

		const column = columnMap[field as keyof typeof columnMap];

		// Get unique values for the specified field, ordered by frequency
		const results = await db
			.select({
				value: column,
				count: sql<number>`COUNT(*)::int`,
			})
			.from(advancedLinkSessions)
			.where(isNotNull(column))
			.groupBy(column)
			.orderBy(sql`COUNT(*) DESC`)
			.limit(50);

		// Extract just the values
		const suggestions = results
			.map((r) => r.value)
			.filter((v): v is string => typeof v === "string" && v.trim().length > 0);

		return NextResponse.json({ suggestions }, { status: 200 });
	} catch (error) {
		console.error("[/api/utm-suggestions] Error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch UTM suggestions", suggestions: [] },
			{ status: 500 }
		);
	}
}
