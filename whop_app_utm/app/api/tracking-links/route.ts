import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import type { TrackingLink, VisitorEvent, Order } from "@/lib/utm/types";

// API route that loads real tracking links from Whop's internal GraphQL
// endpoint. This mirrors the query used by Whop's own dashboard UI.
//
// It expects two env vars:
// - WHOP_API_KEY       (company-level API key)
// - WHOP_COMPANY_ID    (ID of your Whop company, used in the GraphQL query)

const GRAPHQL_ENDPOINT =
	"https://whop.com/api/graphql/fetchCompanyTrackingLinks/";

const FETCH_COMPANY_TRACKING_LINKS_QUERY = `query fetchCompanyTrackingLinks(
  $id: ID!,
  $filters: JSON!,
  $first: Int!,
  $after: String!
) {
  company(id: $id) {
    creatorDashboardTable(tableFilters: $filters) {
      trackingLinks(first: $first, after: $after) {
        nodes {
          ...CompanyTrackingLink
        }
        totalCount
      }
    }
  }
}

fragment CompanyTrackingLink on TrackingLink {
  id
  name
  route
  clicks
  conversionRate
  convertedUsers
  createdAt
  fullUrl
  revenueGenerated
  destination
  accessPass {
    title
  }
  plan {
    formattedPrice
  }
}`;

const PAGE_SIZE = 50;

function encodeWhopCursor(offset: number): string {
	// Whop uses base64-encoded integer offsets for its cursors; "MA==" is 0.
	return Buffer.from(String(offset), "utf-8").toString("base64");
}

export async function GET() {
	const apiKey = process.env.WHOP_APP_API_KEY || process.env.WHOP_API_KEY;
	const companyId = process.env.WHOP_COMPANY_ID;

	const empty: { links: TrackingLink[]; events: VisitorEvent[]; orders: Order[] } =
		{ links: [], events: [], orders: [] };

	const isDev = process.env.NODE_ENV !== "production";

	try {
		// Keep auth check so the route respects Whop sessions, but do not block
		// on it for now – this is primarily gated by the company API key.
		try {
			const hdrs = await headers();
			await whopsdk.verifyUserToken(hdrs);
		} catch {
			// If verification fails, we still allow the request as long as the
			// company API key is configured.
		}

		if (!apiKey || !companyId) {
			console.warn(
				"[/api/tracking-links] Missing WHOP_API_KEY or WHOP_COMPANY_ID; returning empty data.",
			);

			const debugRaw = isDev
				? {
					reason: "missing_env",
					hasApiKey: !!apiKey,
					hasCompanyId: !!companyId,
				}
				: undefined;

			return NextResponse.json({ ...empty, debugRaw }, { status: 200 });
		}

		// Fetch all pages of tracking links by walking the cursor that Whop uses
		// internally. Their UI uses base64-encoded integer offsets, starting at
		// 0 encoded as "MA==". We replicate that here and loop until we've
		// loaded all nodes or hit a safety max.
		let allNodes: any[] = [];
		let offset = 0;
		let lastPageJson: any | null = null;
		const maxPages = 20;

		for (let page = 0; page < maxPages; page += 1) {
			const afterCursor = encodeWhopCursor(offset);

			const response = await fetch(GRAPHQL_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					query: FETCH_COMPANY_TRACKING_LINKS_QUERY,
					operationName: "fetchCompanyTrackingLinks",
					variables: {
						id: companyId,
						filters: {
							destinations: null,
							access_pass_ids: null,
						},
						first: PAGE_SIZE,
						after: afterCursor,
					},
				}),
			});

			if (!response.ok) {
				console.error("[/api/tracking-links] GraphQL HTTP error", response.status);

				const debugRaw = isDev
					? { reason: "http_error", status: response.status }
					: undefined;

				return NextResponse.json({ ...empty, debugRaw }, { status: 200 });
			}

			const json = (await response.json()) as any;
			lastPageJson = json;

			if (json.errors) {
				console.error("[/api/tracking-links] GraphQL errors", json.errors);

				const debugRaw = isDev
					? { reason: "graphql_errors", errors: json.errors }
					: undefined;

				return NextResponse.json({ ...empty, debugRaw }, { status: 200 });
			}

			const pageResult =
				json?.data?.company?.creatorDashboardTable?.trackingLinks;
			const nodes: any[] = pageResult?.nodes ?? [];
			const totalCount: number | undefined =
				typeof pageResult?.totalCount === "number"
					? (pageResult.totalCount as number)
					: undefined;

			allNodes = allNodes.concat(nodes);
			offset += nodes.length;

			if (!totalCount || offset >= totalCount || nodes.length < PAGE_SIZE) {
				break;
			}
		}

		const links: TrackingLink[] = allNodes.map((node: any) => {
			const fullUrl: string | null = node.fullUrl ?? null;

			let utmSource: string | undefined;
			let utmMedium: string | undefined;
			let utmCampaign: string | undefined;

			if (fullUrl) {
				try {
					const url = new URL(fullUrl);
					const params = url.searchParams;
					utmSource = params.get("utm_source") ?? undefined;
					utmMedium = params.get("utm_medium") ?? undefined;
					utmCampaign = params.get("utm_campaign") ?? undefined;
				} catch {
					// If fullUrl is not a valid URL, ignore UTM parsing.
				}
			}

			const slugFromRoute =
				typeof node.route === "string"
					? (node.route as string).replace(/^\/+/, "")
					: undefined;

			const accessPassTitle: string | null = node.accessPass?.title ?? null;
			const planFormattedPrice: string | null = node.plan?.formattedPrice ?? null;

			return {
				id: String(node.id),
				whopLinkId: String(node.id),
				name:
					(node.name as string | null) ??
					(node.destination as string | null) ??
					fullUrl ??
					"Untitled link",
				slug: slugFromRoute || String(node.id),
				product: accessPassTitle ?? planFormattedPrice ?? "Tracking link",
				productPrice: planFormattedPrice ?? undefined,
				trackingUrl: fullUrl ?? undefined,
				destination: (node.destination as string | null) ?? fullUrl ?? "",
				utmSource,
				utmMedium,
				utmCampaign,
				clicks:
					typeof node.clicks === "number" ? node.clicks : undefined,
				convertedUsers:
					typeof node.convertedUsers === "number"
						? node.convertedUsers
						: undefined,
				revenueGenerated:
					typeof node.revenueGenerated === "number"
						? node.revenueGenerated
						: undefined,
				conversionRate:
					typeof node.conversionRate === "number"
						? node.conversionRate
						: undefined,
				createdAt:
					(node.createdAt as string | null) ?? new Date().toISOString(),
			} satisfies TrackingLink;
		});

		// For now we do not have per-event / per-order data from this endpoint, so
		// keep events and orders empty. The metrics hooks will treat this as
		// "no analytics yet" while still showing real links.
		const events: VisitorEvent[] = [];
		const orders: Order[] = [];

		const debugRaw = isDev ? lastPageJson : undefined;

		return NextResponse.json({ links, events, orders, debugRaw }, { status: 200 });
	} catch (error) {
		console.error("/api/tracking-links error", error);

		const debugRaw = isDev
			? { reason: "exception", message: (error as Error).message ?? String(error) }
			: undefined;

		return NextResponse.json({ ...empty, debugRaw }, { status: 200 });
	}
}
