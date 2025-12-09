import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/serverClient";
import { hashIp } from "@/lib/hashIp";
import { db } from "@/lib/db/client";
import { companySettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
	const { slug } = await params;

	if (!slug || typeof slug !== "string") {
		return new Response("Bad Request", { status: 400 });
	}

	let supabase;
	try {
		supabase = createServerSupabaseClient();
	} catch (error) {
		console.error("Failed to initialize Supabase client", error);
		return new Response("Service Unavailable", { status: 503 });
	}

	try {
		// First, try to resolve this slug from the advanced_links table
		// (advanced UTM links created inside this app).
		try {
			const { data: advancedLink, error: advancedError } = await supabase
				.from("advanced_links")
				.select("*")
				.eq("slug", slug)
				.maybeSingle();

			if (advancedError && (advancedError as { code?: string }).code !== "PGRST116") {
				console.error("Error fetching advanced_links by slug", advancedError);
			}

			if (advancedLink) {
				const destination =
					(advancedLink as { tracking_url?: string | null }).tracking_url ||
					(advancedLink as { destination?: string | null }).destination;

				if (!destination || typeof destination !== "string") {
					return new Response("Not Found", { status: 404 });
				}

				// Log click for advanced links into advanced_link_clicks.
				const userAgent = req.headers.get("user-agent") ?? "unknown";
				const referrer = req.headers.get("referer") ?? "unknown";
				const ip =
					req.headers.get("x-forwarded-for") ??
					req.headers.get("x-real-ip") ??
					"unknown";

				const ipHash = hashIp(ip);

				supabase
					.from("advanced_link_clicks")
					.insert({
						advanced_link_id: (advancedLink as { id: string }).id,
						ip_hash: ipHash,
						user_agent: userAgent,
						referrer,
					})
					.then(({ error }) => {
						if (error) {
							console.error(
								"Failed to insert click into advanced_link_clicks",
								error,
							);
						}
					});

				const metaPixelEnabled = Boolean(
					(advancedLink as { meta_pixel_enabled?: boolean }).meta_pixel_enabled,
				);

				if (!metaPixelEnabled) {
					return NextResponse.redirect(destination, 307);
				}

				const companyId = process.env.WHOP_COMPANY_ID;

				if (!companyId) {
					return NextResponse.redirect(destination, 307);
				}

				let metaPixelId: string | null = null;
				try {
					const rows = await db
						.select({ metaPixelId: companySettings.metaPixelId })
						.from(companySettings)
						.where(eq(companySettings.companyId, companyId))
						.limit(1);

					metaPixelId = rows[0]?.metaPixelId ?? null;
				} catch (error) {
					console.error("[t/[slug]] Failed to load Meta Pixel ID", error);
					return NextResponse.redirect(destination, 307);
				}

				if (!metaPixelId || !metaPixelId.trim()) {
					return NextResponse.redirect(destination, 307);
				}

				const safeDestination = destination.replace(/"/g, "&quot;");
				const safeMetaPixelId = metaPixelId.trim().replace(/"/g, "&quot;");

				const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0;url=${safeDestination}" />
    <script>
      (function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)n=f.fbq;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', '${safeMetaPixelId}');
      window.fbq('track', 'PageView');
      setTimeout(function () {
        window.location.href = '${safeDestination}';
      }, 50);
    </script>
    <noscript>
      <img
        alt=""
        height="1"
        width="1"
        style="display:none"
        src="https://www.facebook.com/tr?id=${safeMetaPixelId}&ev=PageView&noscript=1"
      />
    </noscript>
  </head>
  <body>
    <p>Redirecting...</p>
  </body>
</html>`;

				return new Response(html, {
					status: 200,
					headers: {
						"Content-Type": "text/html; charset=utf-8",
						"Cache-Control": "no-store, max-age=0",
					},
				});
			}
		} catch (error) {
			console.error("Unhandled error fetching advanced_links by slug", error);
			// We intentionally fall through to the generated_links lookup so that
			// advanced link issues do not break existing short links.
		}

		// Fallback: resolve from the original generated_links table.
		const { data: link, error: linkError } = await supabase
			.from("generated_links")
			.select("*")
			.eq("slug", slug)
			.single();

		if (linkError) {
			// If the record is simply not found, respond with 404.
			// We avoid leaking internal details.
			if ((linkError as { code?: string }).code === "PGRST116") {
				return new Response("Not Found", { status: 404 });
			}

			console.error("Error fetching generated_links by slug", linkError);
			return new Response("Service Unavailable", { status: 503 });
		}

		if (!link) {
			return new Response("Not Found", { status: 404 });
		}

		// Extract tracking metadata from headers.
		const userAgent = req.headers.get("user-agent") ?? "unknown";
		const referrer = req.headers.get("referer") ?? "unknown";
		const ip =
			req.headers.get("x-forwarded-for") ??
			req.headers.get("x-real-ip") ??
			"unknown";

		const ipHash = hashIp(ip);

		// Fire-and-forget logging of the click. We do not await this so that
		// redirect latency stays minimal, and failures do not block the user.
		supabase
			.from("link_clicks")
			.insert({
				link_id: link.id,
				ip_hash: ipHash,
				user_agent: userAgent,
				referrer,
			})
			.then(({ error }) => {
				if (error) {
					console.error("Failed to insert click into link_clicks", error);
				}
			});

		// Redirect the user to the final destination URL.
		const destination = (link as { full_url?: string }).full_url;
		if (!destination || typeof destination !== "string") {
			// If the record is malformed, avoid leaking internals.
			return new Response("Not Found", { status: 404 });
		}

		return NextResponse.redirect(destination, 307);
	} catch (error) {
		console.error("Unhandled error in /t/[slug] tracking route", error);
		return new Response("Service Unavailable", { status: 503 });
	}
}
