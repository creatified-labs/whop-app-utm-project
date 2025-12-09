import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
	advancedLinks,
	advancedLinkClicks,
	advancedLinkOrders,
} from "@/lib/db/schema";
import type { TrackingLink } from "@/lib/utm/types";

export async function GET(_req: NextRequest) {
	try {
		const rows = await db
			.select({
				id: advancedLinks.id,
				name: advancedLinks.name,
				slug: advancedLinks.slug,
				product: advancedLinks.product,
				productPrice: advancedLinks.productPrice,
				trackingUrl: advancedLinks.trackingUrl,
				destination: advancedLinks.destination,
				utmSource: advancedLinks.utmSource,
				utmMedium: advancedLinks.utmMedium,
				utmCampaign: advancedLinks.utmCampaign,
				metaPixelEnabled: advancedLinks.metaPixelEnabled,
				archived: advancedLinks.archived,
				createdAt: advancedLinks.createdAt,
				clicks: sql<number>`COUNT(DISTINCT ${advancedLinkClicks.id})`,
				ordersCount: sql<number>`COUNT(DISTINCT ${advancedLinkOrders.id})`,
				revenueCents: sql<number>`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)`,
			})
			.from(advancedLinks)
			.leftJoin(
				advancedLinkClicks,
				eq(advancedLinks.id, advancedLinkClicks.advancedLinkId),
			)
			.leftJoin(
				advancedLinkOrders,
				eq(advancedLinks.id, advancedLinkOrders.advancedLinkId),
			)
			.groupBy(
				advancedLinks.id,
				advancedLinks.name,
				advancedLinks.slug,
				advancedLinks.product,
				advancedLinks.productPrice,
				advancedLinks.trackingUrl,
				advancedLinks.destination,
				advancedLinks.utmSource,
				advancedLinks.utmMedium,
				advancedLinks.utmCampaign,
				advancedLinks.metaPixelEnabled,
				advancedLinks.archived,
				advancedLinks.createdAt,
			);

		const links: TrackingLink[] = rows.map((row) => {
			const clicks = Number(row.clicks ?? 0);
			const convertedUsers = Number(row.ordersCount ?? 0);
			const revenueGenerated = Number(row.revenueCents ?? 0) / 100;
			const conversionRate = convertedUsers / Math.max(clicks || 1, 1);

			return {
				id: row.id,
				name: row.name,
				slug: row.slug,
				product: row.product,
				productPrice: row.productPrice ?? undefined,
				trackingUrl: row.trackingUrl ?? undefined,
				archived: row.archived ?? false,
				destination: row.destination,
				utmSource: row.utmSource ?? undefined,
				utmMedium: row.utmMedium ?? undefined,
				utmCampaign: row.utmCampaign ?? undefined,
				metaPixelEnabled: row.metaPixelEnabled ?? false,
				createdAt: row.createdAt,
				clicks,
				convertedUsers,
				revenueGenerated,
				conversionRate,
			} satisfies TrackingLink;
		});

		return NextResponse.json({ links }, { status: 200 });
	} catch (error) {
		console.error("[/api/advanced-links] GET error", error);

		return NextResponse.json(
			{ links: [], error: "Failed to load advanced links" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as TrackingLink | null;

		if (
			!body ||
			!body.id ||
			!body.name ||
			!body.slug ||
			!body.product ||
			!body.destination ||
			!body.createdAt
		) {
			return NextResponse.json(
				{ error: "Missing required fields for advanced link" },
				{ status: 400 },
			);
		}

		await db.insert(advancedLinks).values({
			id: body.id,
			name: body.name,
			slug: body.slug,
			product: body.product,
			productPrice: body.productPrice ?? null,
			trackingUrl: body.trackingUrl ?? null,
			destination: body.destination,
			utmSource: body.utmSource ?? null,
			utmMedium: body.utmMedium ?? null,
			utmCampaign: body.utmCampaign ?? null,
			metaPixelEnabled: body.metaPixelEnabled ?? false,
			archived: body.archived ?? false,
			createdAt: body.createdAt,
		});

		return NextResponse.json({ ok: true }, { status: 201 });
	} catch (error) {
		console.error("[/api/advanced-links] POST error", error);

		return NextResponse.json(
			{ error: "Failed to create advanced link" },
			{ status: 500 },
		);
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const body = (await req.json()) as { id?: string; archived?: boolean } | null;

		if (!body?.id) {
			return NextResponse.json(
				{ error: "Missing id for advanced link update" },
				{ status: 400 },
			);
		}

		const archived = body.archived ?? true;

		await db
			.update(advancedLinks)
			.set({ archived })
			.where(eq(advancedLinks.id, body.id));

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (error) {
		console.error("[/api/advanced-links] PATCH error", error);

		return NextResponse.json(
			{ error: "Failed to update advanced link" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const body = (await req.json()) as { id?: string } | null;

		if (!body?.id) {
			return NextResponse.json(
				{ error: "Missing id for advanced link delete" },
				{ status: 400 },
			);
		}

		const id = body.id;

		await db
			.delete(advancedLinkClicks)
			.where(eq(advancedLinkClicks.advancedLinkId, id));

		await db
			.delete(advancedLinkOrders)
			.where(eq(advancedLinkOrders.advancedLinkId, id));

		await db.delete(advancedLinks).where(eq(advancedLinks.id, id));

		return NextResponse.json({ ok: true }, { status: 200 });
	} catch (error) {
		console.error("[/api/advanced-links] DELETE error", error);

		return NextResponse.json(
			{ error: "Failed to delete advanced link" },
			{ status: 500 },
		);
	}
}
