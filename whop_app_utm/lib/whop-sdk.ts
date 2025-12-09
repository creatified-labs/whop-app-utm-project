import { Whop } from "@whop/sdk";

type WhopSdkLike = any;

let whopsdk: WhopSdkLike;

const appId = process.env.NEXT_PUBLIC_WHOP_APP_ID;
const appApiKey = process.env.WHOP_APP_API_KEY || process.env.WHOP_API_KEY;

if (!appId || !appApiKey) {
	// Fall back to a mock SDK when env vars are missing so the UI can still render.
	console.warn(
		"[whopsdk] Env vars missing; using mock Whop SDK for UI-only development.",
	);
	whopsdk = {
		verifyUserToken: async () => ({ userId: "mock-user-id" }),
		experiences: {
			retrieve: async (experienceId: string) => ({
				id: experienceId,
				name: "Mock experience",
			}),
		},
		users: {
			retrieve: async (userId: string) => ({
				id: userId,
				name: "Mock user",
				username: "mock",
			}),
			checkAccess: async () => ({ hasAccess: true }),
		},
		webhooks: {
			unwrap: (raw: string, _opts: { headers: Record<string, string> }) => {
				try {
					return JSON.parse(raw);
				} catch {
					return { type: "unknown", data: {} };
				}
			},
		},
	};
} else {
	const rawWebhookSecret = process.env.WHOP_WEBHOOK_SECRET || "";
	// Use Node's Buffer API to base64-encode the webhook secret instead of
	// relying on the global btoa, which is not available in the Node runtime.
	const webhookKey = rawWebhookSecret
		? Buffer.from(rawWebhookSecret, "utf8").toString("base64")
		: "";

	whopsdk = new Whop({
		appID: appId,
		apiKey: appApiKey,
		webhookKey,
	});
}

export { whopsdk };
