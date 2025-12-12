import { waitUntil } from "@vercel/functions";
import type { Payment } from "@whop/sdk/resources.js";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companies, advancedLinks, advancedLinkOrders, advancedLinkSessions } from "@/lib/db/schema";
import type { PlanId } from "@/lib/plans";

export async function POST(request: NextRequest): Promise<Response> {
	try {
		// Read raw body once and parse as JSON. For now we do not enforce
		// signature verification so that Whop's "Test webhook" tool works
		// without special headers. In production you can tighten this by
		// re-enabling whopsdk.webhooks.unwrap.
		const requestBodyText = await request.text();
		let webhook: any;
		try {
			webhook = JSON.parse(requestBodyText);
		} catch {
			console.log("[webhooks] Raw body (unparsable)", requestBodyText);
			return new Response("OK", { status: 200 });
		}

		console.log("[webhooks] Received webhook", webhook);

		// Whop test payloads typically use `type`, but other shapes may use
		// `event` or `name`. Support the common variants.
		const eventType =
			(webhook?.type as string | undefined) ||
			(webhook?.event as string | undefined) ||
			(webhook?.name as string | undefined) ||
			"unknown";

		// Best-effort company sync for any event type. Many webhooks (including
		// app installs) include a company/organization object in their payload.
		// We always try to upsert it so the `companies` table is populated on
		// install/load as well as on payments. Pass the full webhook so the
		// helper can look into nested `data`, `payment`, etc.
		waitUntil(syncCompanyFromPayload(webhook as Payment, eventType));

		// Best-effort attribution of payments to advanced links. We look for a
		// wa_link_id query parameter anywhere in the payload, then record an
		// order row tied to that advanced link.
		waitUntil(syncAdvancedOrderFromPayload(webhook, eventType));

		// Best-effort sync of the company's billing plan based on Whop plan IDs
		// present in payment events.
		waitUntil(syncCompanyPlanFromPayload(webhook, eventType));

		// Keep specialised logging for payment succeeded events so we can easily
		// trace them in logs.
		if (eventType === "payment_succeeded" || eventType === "payment.succeeded") {
			console.log("[webhooks] Handling payment succeeded event");
		}
	} catch (error) {
		console.error("[webhooks] Unhandled error in /api/webhooks", error);
	}

	// Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
	return new Response("OK", { status: 200 });
}
async function handlePaymentSucceeded(payment: Payment) {
	// Deprecated: kept for backwards compatibility; delegate to the generic
	// syncCompanyFromPayload helper so payment_succeeded continues to work.
	await syncCompanyFromPayload(payment as any, "payment_succeeded_legacy");
}

function extractAdvancedLinkIdFromPayload(payload: any): string | undefined {
	try {
		// First, try the most structured possibility: a direct metadata.wa_link_id
		// field on the root payload or its data property.
		const directMetaId: string | undefined =
			(typeof payload?.data?.metadata?.wa_link_id === "string"
				? payload.data.metadata.wa_link_id
				: undefined) ??
			(typeof payload?.metadata?.wa_link_id === "string"
				? payload.metadata.wa_link_id
				: undefined);

		if (directMetaId && directMetaId.trim()) {
			return directMetaId.trim();
		}

		const visited = new Set<any>();

		const search = (value: any): string | undefined => {
			if (!value || typeof value !== "object" || visited.has(value)) return undefined;
			visited.add(value);

			for (const v of Object.values(value)) {
				if (typeof v === "string") {
					if (v.includes("wa_link_id=")) {
						try {
							// Try parsing as a full URL first.
							const url = new URL(v, "https://dummy-base.local");
							const id = url.searchParams.get("wa_link_id");
							if (id) return id;
						} catch {
							// Fallback: treat it as a raw query string.
							const query = v.includes("?") ? v.split("?", 2)[1] : v;
							const params = new URLSearchParams(query);
							const id = params.get("wa_link_id");
							if (id) return id;
						}
					}
				} else if (v && typeof v === "object") {
					const found = search(v);
					if (found) return found;
				}
			}

			return undefined;
		};

		return search(payload);
	} catch {
		return undefined;
	}
}

function extractCompanyIdFromPayload(payload: any): string | undefined {
	try {
		const root = payload as any;
		const candidates: any[] = [];
		const pushCandidate = (value: any) => {
			if (value && typeof value === "object") {
				candidates.push(value);
			}
		};

		pushCandidate(root);
		pushCandidate(root.data);
		pushCandidate(root.data?.payment);
		pushCandidate(root.payment);
		pushCandidate(root.payload);

		for (const candidate of candidates) {
			const company = candidate.company ?? candidate.organization ?? null;
			const candidateCompanyId: string | undefined =
				company?.id ?? candidate.company_id ?? candidate.org_id ?? undefined;

			if (candidateCompanyId) {
				return candidateCompanyId;
			}
		}

		return undefined;
	} catch {
		return undefined;
	}
}

function extractPlanIdFromPayload(payload: any): PlanId | undefined {
	const growthExternalId = process.env.NEXT_PUBLIC_WHOP_GROWTH_PLAN_ID;
	const proExternalId = process.env.NEXT_PUBLIC_WHOP_PRO_PLAN_ID;
	// Free plan / install listing. Prefer env override but fall back to the known id.
	const freeExternalId =
		process.env.NEXT_PUBLIC_WHOP_FREE_PLAN_ID || "plan_XySkQj2YjXRvx";

	if (!growthExternalId && !proExternalId && !freeExternalId) return undefined;

	// Prefer the explicit payment.succeeded schema from Whop docs:
	//   payload.data.plan.id is the plan purchased for this payment.
	const root = payload as any;
	const directPlanId: string | undefined =
		root?.data?.plan?.id ??
		root?.plan?.id ??
		root?.data?.product?.plan_id ??
		undefined;

	const matchExternalId = (externalId: string | undefined): PlanId | undefined => {
		if (!externalId || !directPlanId) return undefined;
		if (directPlanId === externalId) {
			if (externalId === proExternalId) return "pro";
			if (externalId === growthExternalId) return "growth";
			if (externalId === freeExternalId) return "free";
		}
		return undefined;
	};

	// Try direct mapping first so Growth/Pro can't be accidentally treated as Free
	// just because the free listing id appears elsewhere in the payload.
	const directMatch =
		matchExternalId(proExternalId) ||
		matchExternalId(growthExternalId) ||
		matchExternalId(freeExternalId);
	if (directMatch) return directMatch;

	// Fallback: broad recursive search as a safety net for unexpected payload
	// shapes. Keep Pro > Growth > Free precedence if multiple ids appear.
	const visited = new Set<any>();
	let sawGrowth = false;
	let sawPro = false;
	let sawFree = false;

	const search = (value: any): void => {
		if (!value || typeof value !== "object" || visited.has(value)) return;
		visited.add(value);

		for (const v of Object.values(value)) {
			if (typeof v === "string") {
				if (growthExternalId && v === growthExternalId) {
					sawGrowth = true;
				}
				if (proExternalId && v === proExternalId) {
					sawPro = true;
				}
				if (freeExternalId && v === freeExternalId) {
					sawFree = true;
				}
			} else if (v && typeof v === "object") {
				search(v);
			}
		}
	};

	search(payload);

	if (sawPro) return "pro";
	if (sawGrowth) return "growth";
	if (sawFree) return "free";
	return undefined;
}

async function syncCompanyPlanFromPayload(payload: any, context: string) {
	// Only care about payment succeeded-style events for plan syncing.
	if (context !== "payment_succeeded" && context !== "payment.succeeded") {
		return;
	}

	try {
		const companyId = extractCompanyIdFromPayload(payload);
		if (!companyId) {
			console.warn("[webhooks] payload missing company id for plan sync", {
				context,
			});
			return;
		}

		const planId = extractPlanIdFromPayload(payload);
		if (!planId) {
			return;
		}

		await db
			.insert(companies)
			.values({ id: companyId, planId })
			.onConflictDoUpdate({
				target: companies.id,
				set: { planId },
			});

		console.log("[COMPANY PLAN UPSERTED]", {
			context,
			companyId,
			planId,
		});
	} catch (error) {
		console.error("[webhooks] Failed to sync company plan from payload", {
			context,
			error,
		});
	}
}

async function syncCompanyFromPayload(payload: any, context: string) {
	// Best-effort sync of the company using this app into the `companies` table.
	try {
		// The exact shape of the payload depends on Whop's API; try several common
		// nesting patterns before giving up (root, data, data.payment, payment, payload).
		const root = payload as any;
		const candidates: any[] = [];
		const pushCandidate = (value: any) => {
			if (value && typeof value === "object") {
				candidates.push(value);
			}
		};

		pushCandidate(root);
		pushCandidate(root.data);
		pushCandidate(root.data?.payment);
		pushCandidate(root.payment);
		pushCandidate(root.payload);

		let companyId: string | undefined;
		let whopUserId: string | undefined;
		let orgSlug: string | undefined;
		let name: string | undefined;
		let email: string | undefined;

		for (const candidate of candidates) {
			const company = candidate.company ?? candidate.organization ?? null;
			const candidateCompanyId: string | undefined =
				company?.id ?? candidate.company_id ?? candidate.org_id ?? undefined;

			if (!candidateCompanyId) {
				continue;
			}

			companyId = candidateCompanyId;
			whopUserId =
				candidate.user_id ?? candidate.buyer_id ?? company?.owner_id ?? undefined;
			orgSlug = company?.slug ?? company?.username ?? undefined;
			name = company?.name ?? company?.title ?? undefined;
			email = company?.email ?? candidate.buyer_email ?? undefined;
			break;
		}

		if (!companyId) {
			console.warn("[webhooks] payload missing company id; skipping companies sync", {
				context,
			});
			console.log("[COMPANY PAYLOAD]", payload);
			return;
		}

		await db
			.insert(companies)
			.values({
				id: companyId,
				whopUserId,
				orgSlug,
				name,
				email,
			})
			.onConflictDoUpdate({
				target: companies.id,
				set: {
					whopUserId,
					orgSlug,
					name,
					email,
				},
			});

		console.log("[COMPANY UPSERTED]", {
			context,
			companyId,
			whopUserId,
			orgSlug,
			name,
			email,
		});
	} catch (error) {
		console.error("[webhooks] Failed to sync company from payload", {
			context,
			error,
		});
		console.log("[COMPANY PAYLOAD]", payload);
	}
}

async function syncAdvancedOrderFromPayload(payload: any, context: string) {
	// Best-effort attribution of a payment/order to an advanced link.
	try {
		let advancedLinkId = extractAdvancedLinkIdFromPayload(payload);
		const isPaymentSucceeded =
			context === "payment.succeeded" || context === "payment_succeeded";

		// If this is a payment event and we still don't have a wa_link_id, try to
		// fetch the membership from Whop's API to read metadata.wa_link_id.
		if (!advancedLinkId && isPaymentSucceeded) {
			const root = payload as any;
			const membershipId: string | undefined =
				root?.data?.membership?.id ??
				root?.data?.membership_id ??
				root?.membership?.id ??
				root?.membership_id ??
				undefined;

			const apiKey = process.env.WHOP_API_KEY || process.env.WHOP_APP_API_KEY;

			if (membershipId && apiKey) {
				try {
					const res = await fetch(
						`https://api.whop.com/api/v2/memberships/${membershipId}`,
						{
							headers: {
								Authorization: `Bearer ${apiKey}`,
							},
						},
					);

					if (res.ok) {
						const membership = (await res.json()) as any;
						const metaId =
							typeof membership?.metadata?.wa_link_id === "string"
								? (membership.metadata.wa_link_id as string)
								: undefined;
						if (metaId && metaId.trim()) {
							advancedLinkId = metaId.trim();
						}
					}
				} catch (error) {
					console.error(
						"[webhooks] Failed to fetch membership for advanced order metadata",
						{ context, membershipId, error },
					);
				}
			}
		}

		if (!advancedLinkId) {
			return;
		}

		// Ensure the advanced link exists.
		const existing = await db
			.select({ id: advancedLinks.id })
			.from(advancedLinks)
			.where(eq(advancedLinks.id, advancedLinkId))
			.limit(1);

		if (!existing.length) {
			console.warn("[webhooks] wa_link_id did not match any advanced_links", {
				context,
				advancedLinkId,
			});
			return;
		}

		// Try to find a candidate payment-like object with amount/currency.
		const root = payload as any;
		const data = root?.data ?? {};
		const candidates: any[] = [];
		const pushCandidate = (value: any) => {
			if (value && typeof value === "object") {
				candidates.push(value);
			}
		};

		let amountCents: number | undefined;
		let currency: string | undefined;

		// For payment-style events, prefer the direct amount/currency fields on
		// data (e.g. final_amount, subtotal, currency).
		const rawAmountDirect =
			(data.final_amount as number | string | undefined) ??
			(data.subtotal as number | string | undefined) ??
			(data.amount as number | string | undefined) ??
			(data.total as number | string | undefined) ??
			(data.value as number | string | undefined);
		const rawCurrencyDirect =
			(data.currency as string | undefined) ??
			(data.currency_code as string | undefined) ??
			(data.currencyCode as string | undefined);

		if (rawAmountDirect != null && rawCurrencyDirect) {
			let numericAmount: number | undefined;
			if (typeof rawAmountDirect === "number") {
				numericAmount = rawAmountDirect;
			} else if (typeof rawAmountDirect === "string") {
				const parsed = Number(rawAmountDirect);
				if (!Number.isNaN(parsed)) numericAmount = parsed;
			}

			if (numericAmount != null) {
				amountCents = Math.round(numericAmount * 100);
				currency = rawCurrencyDirect;
			}
		}

		pushCandidate(root);
		pushCandidate(root.data);
		pushCandidate(root.data?.payment);
		pushCandidate(root.payment);
		pushCandidate(root.payload);

		if (amountCents == null || !currency) {
			for (const candidate of candidates) {
				const rawAmount =
					(candidate.amount as number | string | undefined) ??
					(candidate.total as number | string | undefined) ??
					(candidate.value as number | string | undefined);
				const rawCurrency =
					(candidate.currency as string | undefined) ??
					(candidate.currency_code as string | undefined) ??
					(candidate.currencyCode as string | undefined);

				if (rawAmount == null || !rawCurrency) {
					continue;
				}

				let numericAmount: number | undefined;
				if (typeof rawAmount === "number") {
					numericAmount = rawAmount;
				} else if (typeof rawAmount === "string") {
					const parsed = Number(rawAmount);
					if (!Number.isNaN(parsed)) numericAmount = parsed;
				}

				if (numericAmount == null) continue;

				amountCents = Math.round(numericAmount * 100);
				currency = rawCurrency;
				break;
			}
		}

		if (amountCents == null || !currency) {
			console.warn("[webhooks] Could not infer amount/currency for advanced order", {
				context,
				advancedLinkId,
			});
			return;
		}

		// Extract UTM parameters and session token from metadata
		const extractMetadata = (payload: any) => {
			const root = payload as any;
			const metadata =
				root?.data?.metadata ??
				root?.metadata ??
				root?.data?.payment?.metadata ??
				root?.payment?.metadata ??
				{};

			return {
				utmSource: typeof metadata.utm_source === "string" ? metadata.utm_source : null,
				utmMedium: typeof metadata.utm_medium === "string" ? metadata.utm_medium : null,
				utmCampaign: typeof metadata.utm_campaign === "string" ? metadata.utm_campaign : null,
				sessionToken: typeof metadata.session_token === "string" ? metadata.session_token : null,
			};
		};

		// Extract whop_user_id from payload
		const extractWhopUserId = (payload: any): string | null => {
			const root = payload as any;
			return (
				root?.data?.user?.id ??
				root?.user?.id ??
				root?.data?.buyer_id ??
				root?.buyer_id ??
				root?.data?.user_id ??
				root?.user_id ??
				null
			);
		};

		const { utmSource, utmMedium, utmCampaign, sessionToken } = extractMetadata(payload);
		const whopUserId = extractWhopUserId(payload);

		// Insert order with UTM data
		await db.insert(advancedLinkOrders).values({
			advancedLinkId,
			amountCents,
			currency,
			utmSource,
			utmMedium,
			utmCampaign,
			whopUserId,
			sessionId: sessionToken,
		});

		console.log("[ADVANCED ORDER UPSERTED]", {
			context,
			advancedLinkId,
			amountCents,
			currency,
			utmSource,
			utmMedium,
			utmCampaign,
			whopUserId,
			sessionToken,
		});

		// Update session with conversion timestamp if session_token exists
		if (sessionToken) {
			try {
				await db
					.update(advancedLinkSessions)
					.set({ convertedAt: new Date() })
					.where(eq(advancedLinkSessions.sessionToken, sessionToken));

				console.log("[SESSION CONVERTED]", {
					sessionToken,
					advancedLinkId,
				});
			} catch (error) {
				console.error("[webhooks] Failed to update session conversion", {
					sessionToken,
					error,
				});
			}
		}
	} catch (error) {
		console.error("[webhooks] Failed to sync advanced order from payload", {
			context,
			error,
		});
		console.log("[ADVANCED ORDER PAYLOAD]", payload);
	}
}
