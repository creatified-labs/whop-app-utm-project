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
	amountCents: integer("amount_cents").notNull(),
	currency: text("currency").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
