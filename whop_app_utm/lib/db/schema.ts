import { boolean, integer, pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

// Drizzle schema for tracking links stored in Supabase.
// These tables back the /t/[slug] redirect route and click logging.

export const generatedLinks = pgTable("generated_links", {
	id: uuid("id").defaultRandom().primaryKey(),
	slug: text("slug").notNull().unique(),
	fullUrl: text("full_url").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// Advanced tracking links created inside this app. These are separate from
// Whop's own tracking links and from the generated_links redirect table.

export const advancedLinks = pgTable("advanced_links", {
	// Client-generated ID such as "adv_1711384829".
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	product: text("product").notNull(),
	productPrice: text("product_price"),
	trackingUrl: text("tracking_url"),
	destination: text("destination").notNull(),
	utmSource: text("utm_source"),
	utmMedium: text("utm_medium"),
	utmCampaign: text("utm_campaign"),
	metaPixelEnabled: boolean("meta_pixel_enabled").notNull().default(false),
	archived: boolean("archived").notNull().default(false),
	lastHealthCheck: timestamp("last_health_check", { withTimezone: true }),
	isHealthy: boolean("is_healthy").default(true),
	createdAt: text("created_at").notNull(),
});

// Companies using this app, keyed by Whop company ID (e.g. "biz_xxx").

export const companies = pgTable("companies", {
	id: text("id").primaryKey(),
	whopUserId: text("whop_user_id"),
	orgSlug: text("org_slug"),
	name: text("name"),
	email: text("email"),
	planId: text("plan_id"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

// Per-company workspace settings (e.g. Meta Pixel configuration).

export const companySettings = pgTable("company_settings", {
	companyId: text("company_id").primaryKey(),
	metaPixelId: text("meta_pixel_id"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const dashboardLayouts = pgTable(
	"dashboard_layouts",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		companyId: text("company_id").notNull(),
		layoutJson: text("layout_json").notNull(),
		modulesJson: text("modules_json").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => ({
		companyUnique: uniqueIndex("dashboard_layouts_company_id_key").on(
			table.companyId,
		),
	}),
);

export const linkClicks = pgTable("link_clicks", {
	id: uuid("id").defaultRandom().primaryKey(),
	linkId: uuid("link_id")
		.notNull()
		.references(() => generatedLinks.id, { onDelete: "cascade" }),
	ipHash: text("ip_hash").notNull(),
	userAgent: text("user_agent").notNull(),
	referrer: text("referrer").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const advancedLinkClicks = pgTable("advanced_link_clicks", {
	id: uuid("id").defaultRandom().primaryKey(),
	advancedLinkId: text("advanced_link_id")
		.notNull()
		.references(() => advancedLinks.id, { onDelete: "cascade" }),
	ipHash: text("ip_hash").notNull(),
	userAgent: text("user_agent").notNull(),
	referrer: text("referrer").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const advancedLinkOrders = pgTable("advanced_link_orders", {
	id: uuid("id").defaultRandom().primaryKey(),
	advancedLinkId: text("advanced_link_id")
		.notNull()
		.references(() => advancedLinks.id, { onDelete: "cascade" }),
	whopOrderId: text("whop_order_id"),
	amountCents: integer("amount_cents").notNull(),
	currency: text("currency").notNull(),
	utmSource: text("utm_source"),
	utmMedium: text("utm_medium"),
	utmCampaign: text("utm_campaign"),
	utmContent: text("utm_content"),
	utmTerm: text("utm_term"),
	whopUserId: text("whop_user_id"),
	sessionToken: text("session_token"),
	deviceType: text("device_type"),
	browser: text("browser"),
	countryCode: text("country_code"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const advancedLinkSessions = pgTable("advanced_link_sessions", {
	id: uuid("id").defaultRandom().primaryKey(),
	advancedLinkId: text("advanced_link_id")
		.notNull()
		.references(() => advancedLinks.id, { onDelete: "cascade" }),
	utmSource: text("utm_source"),
	utmMedium: text("utm_medium"),
	utmCampaign: text("utm_campaign"),
	utmContent: text("utm_content"),
	utmTerm: text("utm_term"),
	sessionToken: text("session_token").notNull().unique(),
	deviceType: text("device_type"),
	browser: text("browser"),
	browserVersion: text("browser_version"),
	os: text("os"),
	osVersion: text("os_version"),
	countryCode: text("country_code"),
	countryName: text("country_name"),
	city: text("city"),
	ipHash: text("ip_hash"),
	referrer: text("referrer"),
	userAgent: text("user_agent"),
	clickedAt: timestamp("clicked_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	convertedAt: timestamp("converted_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
