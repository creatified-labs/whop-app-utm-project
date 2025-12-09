import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dashboardLayouts, companies } from "@/lib/db/schema";
import { whopsdk } from "@/lib/whop-sdk";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await params;

  try {
    const rows = await db
      .select()
      .from(dashboardLayouts)
      .where(eq(dashboardLayouts.companyId, companyId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ modules: null, layout: null }, { status: 200 });
    }

    let modules: unknown = null;
    let layout: unknown = null;

    try {
      modules = row.modulesJson ? JSON.parse(row.modulesJson) : null;
    } catch {
      modules = null;
    }

    try {
      layout = row.layoutJson ? JSON.parse(row.layoutJson) : null;
    } catch {
      layout = null;
    }

    return NextResponse.json({ modules, layout }, { status: 200 });
  } catch (error) {
    console.error("[/api/dashboard-layout] GET error", error);

    return NextResponse.json(
      { modules: null, layout: null, error: "Failed to load dashboard layout" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await params;

  try {
    const body = (await req.json()) as {
      modules?: unknown;
      layout?: unknown;
    } | null;

    if (!body) {
      return NextResponse.json(
        { error: "Missing dashboard layout payload" },
        { status: 400 },
      );
    }

    const layoutJson = JSON.stringify(body.layout ?? []);
    const modulesJson = JSON.stringify(body.modules ?? []);

    // Try to enrich the companies table with data from Whop using the
    // configured SDK. In local/mock mode this will no-op and we fall back to
    // inserting just the bare company id.
    let whopCompany: any | null = null;
    try {
      const hasCompaniesClient =
        (whopsdk as any)?.companies &&
        typeof (whopsdk as any).companies.retrieve === "function";

      if (hasCompaniesClient) {
        whopCompany = await (whopsdk as any).companies.retrieve(companyId);
      }
    } catch (error) {
      console.warn("[/api/dashboard-layout] Failed to fetch company from Whop", error);
    }

    if (whopCompany) {
      const insertData: any = {
        id: companyId,
        whopUserId: whopCompany.owner_user?.id ?? null,
        orgSlug: whopCompany.route ?? null,
        name: whopCompany.title ?? null,
        // Map Whop's created_at / updated_at into our timestamp columns.
        createdAt: new Date(whopCompany.created_at),
        updatedAt: new Date(whopCompany.updated_at),
      };

      const updateData: any = {
        whopUserId: insertData.whopUserId,
        orgSlug: insertData.orgSlug,
        name: insertData.name,
        createdAt: insertData.createdAt,
        updatedAt: insertData.updatedAt,
      };

      await db
        .insert(companies)
        .values(insertData)
        .onConflictDoUpdate({
          target: companies.id,
          set: updateData,
        });
    } else {
      await db
        .insert(companies)
        .values({ id: companyId })
        .onConflictDoNothing();
    }

    await db
      .insert(dashboardLayouts)
      .values({
        companyId,
        layoutJson,
        modulesJson,
      })
      .onConflictDoUpdate({
        target: dashboardLayouts.companyId,
        set: {
          layoutJson,
          modulesJson,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[/api/dashboard-layout] POST error", error);

    return NextResponse.json(
      { error: "Failed to save dashboard layout" },
      { status: 500 },
    );
  }
}
