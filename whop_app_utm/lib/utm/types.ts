export type TrackingLink = {
	id: string;
	whopLinkId?: string;
	name: string;
	slug: string;
	product: string;
	productPrice?: string;
	trackingUrl?: string;
	archived?: boolean;
	destination: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	metaPixelEnabled?: boolean;
	createdAt: string;
	clicks?: number;
	convertedUsers?: number;
	revenueGenerated?: number;
	conversionRate?: number;
};

export type VisitorEvent = {
	id: string;
	visitorId: string;
	linkId: string; // TrackingLink.id
	type: "click" | "page_view" | "checkout_start";
	occurredAt: string;
};

export type Order = {
	id: string;
	visitorId: string;
	linkId: string; // last-touch link for now
	product: string;
	amount: number;
	currency: "USD" | "GBP" | "EUR";
	createdAt: string;
};

export type LinkMetrics = {
	linkId: string;
	clicks: number;
	orders: number;
	revenue: number;
	conversionRate: number;
};

export type OverviewMetrics = {
	totalRevenue: number;
	totalClicks: number;
	totalOrders: number;
	avgOrderValue: number;
	overallConversionRate: number;
};

export type SourceMetrics = {
	utmSource: string;
	clicks: number;
	orders: number;
	revenue: number;
};

export type CampaignMetrics = {
	utmCampaign: string;
	clicks: number;
	orders: number;
	revenue: number;
	conversionRate: number;
};

export type DeviceMetrics = {
	deviceType: string;
	clicks: number;
	orders: number;
	revenue: number;
};
