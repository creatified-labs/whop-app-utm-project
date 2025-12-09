import { NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

// Temporary overrides to map specific products to their known Whop checkout
// plan IDs, so that advanced links can generate working checkout URLs.
const CHECKOUT_OVERRIDES: Record<string, string> = {
  // Whop Apps Made Simple → plan-based checkout
  "Whop Apps Made Simple": "plan_StRGvE1WQUqxs",
};

type WhopProductLite = {
  id: string;
  title: string;
  route?: string | null;
  checkoutId?: string | null;
  category?: string | null;
};

export async function GET() {
  const companyId = process.env.WHOP_COMPANY_ID;
  const isDev = process.env.NODE_ENV !== "production";

  if (!companyId) {
    const debugRaw = isDev ? { reason: "missing_company_id" } : undefined;
    return NextResponse.json({ products: [], debugRaw }, { status: 200 });
  }

  try {
    const products: WhopProductLite[] = [];

    const productsApi: any = (whopsdk as any)?.products;
    const plansApi: any = (whopsdk as any)?.plans;

    if (!productsApi || typeof productsApi.list !== "function") {
      const debugRaw = isDev ? { reason: "sdk_missing_products" } : undefined;
      return NextResponse.json({ products, debugRaw }, { status: 200 });
    }

    // Build a map of product -> primary plan ID by querying Whop plans for this
    // company. This lets us automatically generate checkout URLs like
    // https://whop.com/checkout/plan_xxx without manual setup per product.
    const productToPlanId: Record<string, string> = {};

    if (plansApi && typeof plansApi.list === "function") {
      try {
        for await (const plan of plansApi.list({ company_id: companyId })) {
          const planId = typeof plan.id === "string" ? plan.id : String(plan.id);
          const productIdForPlan: string | null =
            (plan as any)?.product?.id != null
              ? String((plan as any).product.id)
              : null;

          if (!productIdForPlan) continue;

          // Prefer the first visible / buy_now style plan we see for a given
          // product, but if those hints are missing, just take the first.
          if (!productToPlanId[productIdForPlan]) {
            productToPlanId[productIdForPlan] = planId;
          }
        }
      } catch (error) {
        console.error("[/api/whop-products] failed to list plans", error);
      }
    }

    for await (const item of productsApi.list({ company_id: companyId })) {
      const title =
        (item.title as string | null) ??
        (item.name as string | null) ??
        "Untitled product";

      const productId = String(item.id);

      const overrideCheckoutId = CHECKOUT_OVERRIDES[title] ?? null;
      const inferredPlanId = productToPlanId[productId] ?? null;

      const rawType =
        (item as any)?.business_type ??
        (item as any)?.product_type ??
        (item as any)?.type ??
        (item as any)?.kind ??
        (item as any)?.category ??
        null;

      // Default everything to the generic "Products" bucket unless we can
      // confidently detect that this is an app or an app plan.
      let category: string | null = "Products";
      if (typeof rawType === "string" && rawType.trim()) {
        const lower = rawType.toLowerCase();

        // App plans (e.g. Whop "app_product" business type) – these represent
        // specific paid plans for apps.
        if (lower.includes("app_product") || lower.includes("app product")) {
          category = "App Plans";
        }
        // Standalone apps (anything else that still clearly looks like an app).
        else if (lower.includes("app")) {
          category = "Apps";
        }
      }

      products.push({
        id: productId,
        title,
        route: (item.route as string | null) ?? null,
        // Priority for checkout URLs:
        // 1) Manual overrides by title (CHECKOUT_OVERRIDES),
        // 2) Automatically discovered plan ID for this product,
        // 3) Fallback to the product ID so existing behavior doesn't break.
        checkoutId: overrideCheckoutId ?? inferredPlanId ?? productId,
        category,
      });
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("[/api/whop-products] error", error);
    const debugRaw = isDev
      ? { reason: "exception", message: (error as Error).message ?? String(error) }
      : undefined;

    return NextResponse.json({ products: [], debugRaw }, { status: 200 });
  }
}
