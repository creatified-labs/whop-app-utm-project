import { NextRequest, NextResponse } from "next/server";

// Server-side helper route to create a Whop checkout session and attach
// metadata (including wa_link_id) so that later webhook events can be
// attributed back to a specific advanced tracking link.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      planId?: string;
      waLinkId?: string;
    } | null;

    const planId = body?.planId?.trim();
    const waLinkId = body?.waLinkId?.trim();

    if (!planId || !waLinkId) {
      return NextResponse.json(
        { error: "Missing planId or waLinkId" },
        { status: 400 },
      );
    }

    const hasCompanyKey = Boolean(process.env.WHOP_API_KEY);
    const hasAppKey = Boolean(process.env.WHOP_APP_API_KEY);

    const apiKey = process.env.WHOP_API_KEY || process.env.WHOP_APP_API_KEY;

    const apiKeyPrefix = apiKey ? `${apiKey.slice(0, 8)}…` : "<none>";
    console.log("[/api/create-whop-checkout] key debug", {
      hasCompanyKey,
      hasAppKey,
      apiKeySource: hasCompanyKey ? "WHOP_API_KEY" : hasAppKey ? "WHOP_APP_API_KEY" : "none",
      apiKeyPrefix,
    });

    if (!apiKey) {
      console.error("[/api/create-whop-checkout] Missing WHOP_API_KEY/WHOP_APP_API_KEY");
      return NextResponse.json(
        { error: "Whop API key is not configured" },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.whop.com/api/v2/checkout_sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        metadata: {
          wa_link_id: waLinkId,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[/api/create-whop-checkout] Whop API error", {
        status: response.status,
        body: text,
      });
      return NextResponse.json(
        { error: "Failed to create Whop checkout session" },
        { status: 500 },
      );
    }

    const data = (await response.json()) as { purchase_url?: string };

    if (!data.purchase_url || typeof data.purchase_url !== "string") {
      console.error("[/api/create-whop-checkout] Missing purchase_url in Whop response", data);
      return NextResponse.json(
        { error: "Whop checkout session did not return a purchase_url" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { purchaseUrl: data.purchase_url },
      { status: 200 },
    );
  } catch (error) {
    console.error("[/api/create-whop-checkout] Unhandled error", error);
    return NextResponse.json(
      { error: "Failed to create Whop checkout session" },
      { status: 500 },
    );
  }
}
