import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { generatedLinks } from "@/lib/db/schema";

// Simple Drizzle + Supabase example API.
//
// GET /api/generated-links
//
// Returns the contents of the `generated_links` table from your Supabase
// database using Drizzle ORM. This is a good way to confirm that:
// - SUPABASE_DB_URL, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
// - The Drizzle client can connect to your Supabase Postgres instance
// - The `generated_links` table exists and has data.

export async function GET(_req: NextRequest) {
  try {
    const rows = await db.select().from(generatedLinks);

    return NextResponse.json(
      {
        links: rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("/api/generated-links error", error);

    return NextResponse.json(
      {
        error: "Failed to load generated_links from database",
      },
      { status: 500 },
    );
  }
}
