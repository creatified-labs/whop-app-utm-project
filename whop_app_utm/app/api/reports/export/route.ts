import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { advancedLinks, advancedLinkClicks, advancedLinkOrders } from "@/lib/db/schema";
import { sql, and, gte, lte, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const reportType = searchParams.get("reportType") || "full"; // source, campaign, full
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		let csvContent = "";
		let filename = "report.csv";

		if (reportType === "source") {
			// Source breakdown CSV
			const dateConditions = [];
			if (startDate) dateConditions.push(gte(advancedLinkOrders.createdAt, new Date(startDate)));
			if (endDate) dateConditions.push(lte(advancedLinkOrders.createdAt, new Date(endDate)));

			const sourceData = await db
				.select({
					utmSource: advancedLinks.utmSource,
					clicks: sql<number>`COUNT(DISTINCT ${advancedLinkClicks.id})::int`,
					orders: sql<number>`COUNT(DISTINCT ${advancedLinkOrders.id})::int`,
					revenue: sql<number>`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int`,
				})
				.from(advancedLinks)
				.leftJoin(
					advancedLinkClicks,
					and(
						sql`${advancedLinkClicks.advancedLinkId} = ${advancedLinks.id}`,
						...(startDate ? [gte(advancedLinkClicks.createdAt, new Date(startDate))] : []),
						...(endDate ? [lte(advancedLinkClicks.createdAt, new Date(endDate))] : [])
					)
				)
				.leftJoin(
					advancedLinkOrders,
					and(
						sql`${advancedLinkOrders.advancedLinkId} = ${advancedLinks.id}`,
						...dateConditions
					)
				)
				.where(isNotNull(advancedLinks.utmSource))
				.groupBy(advancedLinks.utmSource)
				.orderBy(sql`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0) DESC`);

			csvContent = "Source,Clicks,Orders,Revenue,Conversion Rate\n";
			sourceData.forEach((row) => {
				const clicks = row.clicks || 0;
				const orders = row.orders || 0;
				const revenue = ((row.revenue || 0) / 100).toFixed(2);
				const conversionRate = clicks > 0 ? ((orders / clicks) * 100).toFixed(2) : "0.00";
				csvContent += `${row.utmSource},${clicks},${orders},${revenue},${conversionRate}%\n`;
			});

			filename = `source-breakdown-${new Date().toISOString().split("T")[0]}.csv`;
		} else if (reportType === "campaign") {
			// Campaign breakdown CSV
			const dateConditions = [];
			if (startDate) dateConditions.push(gte(advancedLinkOrders.createdAt, new Date(startDate)));
			if (endDate) dateConditions.push(lte(advancedLinkOrders.createdAt, new Date(endDate)));

			const campaignData = await db
				.select({
					utmCampaign: advancedLinks.utmCampaign,
					clicks: sql<number>`COUNT(DISTINCT ${advancedLinkClicks.id})::int`,
					orders: sql<number>`COUNT(DISTINCT ${advancedLinkOrders.id})::int`,
					revenue: sql<number>`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0)::int`,
				})
				.from(advancedLinks)
				.leftJoin(
					advancedLinkClicks,
					and(
						sql`${advancedLinkClicks.advancedLinkId} = ${advancedLinks.id}`,
						...(startDate ? [gte(advancedLinkClicks.createdAt, new Date(startDate))] : []),
						...(endDate ? [lte(advancedLinkClicks.createdAt, new Date(endDate))] : [])
					)
				)
				.leftJoin(
					advancedLinkOrders,
					and(
						sql`${advancedLinkOrders.advancedLinkId} = ${advancedLinks.id}`,
						...dateConditions
					)
				)
				.where(isNotNull(advancedLinks.utmCampaign))
				.groupBy(advancedLinks.utmCampaign)
				.orderBy(sql`COALESCE(SUM(${advancedLinkOrders.amountCents}), 0) DESC`);

			csvContent = "Campaign,Clicks,Orders,Revenue,Conversion Rate\n";
			campaignData.forEach((row) => {
				const clicks = row.clicks || 0;
				const orders = row.orders || 0;
				const revenue = ((row.revenue || 0) / 100).toFixed(2);
				const conversionRate = clicks > 0 ? ((orders / clicks) * 100).toFixed(2) : "0.00";
				csvContent += `${row.utmCampaign},${clicks},${orders},${revenue},${conversionRate}%\n`;
			});

			filename = `campaign-breakdown-${new Date().toISOString().split("T")[0]}.csv`;
		} else {
			// Full report with all orders
			const dateConditions = [];
			if (startDate) dateConditions.push(gte(advancedLinkOrders.createdAt, new Date(startDate)));
			if (endDate) dateConditions.push(lte(advancedLinkOrders.createdAt, new Date(endDate)));

			const ordersData = await db
				.select({
					orderId: advancedLinkOrders.id,
					linkName: advancedLinks.name,
					utmSource: advancedLinks.utmSource,
					utmMedium: advancedLinks.utmMedium,
					utmCampaign: advancedLinks.utmCampaign,
					amount: advancedLinkOrders.amountCents,
					currency: advancedLinkOrders.currency,
					createdAt: advancedLinkOrders.createdAt,
				})
				.from(advancedLinkOrders)
				.leftJoin(advancedLinks, sql`${advancedLinkOrders.advancedLinkId} = ${advancedLinks.id}`)
				.where(dateConditions.length > 0 ? and(...dateConditions) : undefined)
				.orderBy(advancedLinkOrders.createdAt);

			csvContent = "Order ID,Link Name,Source,Medium,Campaign,Amount,Currency,Date\n";
			ordersData.forEach((row) => {
				const amount = ((row.amount || 0) / 100).toFixed(2);
				const date = row.createdAt?.toISOString().split("T")[0] || "";
				csvContent += `${row.orderId},${row.linkName || ""},${row.utmSource || ""},${row.utmMedium || ""},${row.utmCampaign || ""},${amount},${row.currency || "USD"},${date}\n`;
			});

			filename = `full-report-${new Date().toISOString().split("T")[0]}.csv`;
		}

		return new NextResponse(csvContent, {
			status: 200,
			headers: {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("[/api/reports/export] Error:", error);
		return NextResponse.json(
			{ error: "Failed to export report" },
			{ status: 500 }
		);
	}
}
