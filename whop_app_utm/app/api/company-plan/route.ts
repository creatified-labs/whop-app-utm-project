import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companies } from "@/lib/db/schema";
import type { PlanId } from "@/lib/plans";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const companyId = searchParams.get("companyId");

	if (!companyId) {
		// If we don't know which company, default to free.
		return NextResponse.json({ planId: "free" satisfies PlanId }, { status: 200 });
	}

	try {
		const rows = await db
			.select({ planId: companies.planId })
			.from(companies)
			.where(eq(companies.id, companyId))
			.limit(1);

		const row = rows[0];
		const planId = (row?.planId as PlanId | null | undefined) ?? "free";

		return NextResponse.json({ planId }, { status: 200 });
	} catch (error) {
		console.error("/api/company-plan GET error", error);
		return NextResponse.json({ planId: "free" as PlanId }, { status: 200 });
	}
}
