import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase server client for backend-only operations.
// In UI-only development we fall back to a lightweight mock when env vars are missing.

export function createServerSupabaseClient(): SupabaseClient {
	const url = process.env.SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url || !serviceRoleKey) {
		// TODO: Wire real Supabase client once backend configuration is ready.
		console.warn(
			"[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing; returning mock client for UI-only dev.",
		);
		const mockClient: any = {
			from() {
				return {
					select: () => Promise.reject(new Error("Supabase disabled in UI-only build")),
					insert: () => Promise.reject(new Error("Supabase disabled in UI-only build")),
				};
			},
		};
		return mockClient as SupabaseClient;
	}

	return createClient(url, serviceRoleKey, {
		auth: {
			persistSession: false,
		},
	});
}
