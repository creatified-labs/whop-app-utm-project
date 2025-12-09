import type { ReactNode } from "react";
import { headers } from "next/headers";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeaderTitle } from "@/components/dashboard/DashboardHeaderTitle";
import { MetaPixelLoader } from "@/components/meta/MetaPixelLoader";
import { whopsdk } from "@/lib/whop-sdk";

interface CompanyDashboardLayoutProps {
	children: ReactNode;
	params: Promise<{
		companyId?: string;
	}>;
}

export default async function CompanyDashboardLayout({
	children,
	params,
}: CompanyDashboardLayoutProps) {
	const resolvedParams = await params;
	const companyId = resolvedParams.companyId ?? "workspace";
	const companySlug = companyId.replace(/[-_]+/g, " ").trim();
	const companyName = companySlug
		.split(" ")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ") || "Workspace";

	const companyInitials = companySlug
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("") || "WS";

	const hdrs = await headers();
	let accountName = companyName;
	let avatarInitials = companyInitials;
	let avatarUrl: string | null = null;

	try {
		const { userId } = await whopsdk.verifyUserToken(hdrs);
		const user = await whopsdk.users.retrieve(userId);
		const name = user?.name || null;
		const username = user?.username || null;
		accountName = name || (username ? `@${username}` : companyName);
		if (name) {
			const nameSlug = name.replace(/[-_]+/g, " ").trim();
			const parts = nameSlug.split(" ").filter(Boolean).slice(0, 2);
			if (parts.length > 0) {
				avatarInitials = parts
					.map((part: string) => part.charAt(0).toUpperCase())
					.join("");
			}
		}
		const profilePicture = user?.profile_picture || null;
		if (profilePicture && typeof profilePicture.url === "string") {
			avatarUrl = profilePicture.url;
		}
	} catch {
	}
	const settingsHref = `/dashboard/${companyId}/settings`;
	return (
		<div className="relative min-h-screen bg-background text-foreground antialiased">
			<MetaPixelLoader companyId={companyId} />
			<main className="min-h-screen flex flex-col pt-20">
				<header className="px-4 sm:px-6 lg:px-10 pt-4 pb-3 space-y-4">
					<div className="flex items-center gap-3">
						<div className="flex-1 max-w-4xl mx-auto">
							<DashboardSidebar />
						</div>
					</div>

					<div className="pt-1 pb-2 space-y-3">
						<DashboardHeaderTitle />
					</div>
				</header>

				<div className="flex-1 px-4 sm:px-6 lg:px-10 pb-6">
					{children}
				</div>
			</main>
		</div>
	);
}
