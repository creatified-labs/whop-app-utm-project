import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companySettings } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const companyId = searchParams.get("companyId");

	if (!companyId) {
		return NextResponse.json({ metaPixelId: null }, { status: 200 });
	}

	try {
		const rows = await db
			.select()
			.from(companySettings)
			.where(eq(companySettings.companyId, companyId))
			.limit(1);

		const row = rows[0];
		return NextResponse.json({ metaPixelId: row?.metaPixelId ?? null }, { status: 200 });
	} catch (error) {
		console.error("/api/meta-pixel GET error", error);
		return NextResponse.json({ metaPixelId: null }, { status: 200 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as { companyId?: string; metaPixelId?: string };
		const companyId = body.companyId?.trim();
		const metaPixelId = body.metaPixelId?.trim() || null;

		if (!companyId) {
			return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
		}

		const now = new Date();

		await db
			.insert(companySettings)
			.values({ companyId, metaPixelId, createdAt: now, updatedAt: now })
			.onConflictDoUpdate({
				target: companySettings.companyId,
				set: { metaPixelId, updatedAt: now },
			});

		return NextResponse.json({ metaPixelId }, { status: 200 });
	} catch (error) {
		console.error("/api/meta-pixel POST error", error);
		return NextResponse.json({ error: "Failed to save Meta Pixel" }, { status: 200 });
	}
}
