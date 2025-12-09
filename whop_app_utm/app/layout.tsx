import { WhopApp } from "@whop/react/components";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppFooter } from "@/components/layout/AppFooter";
import { CurrentPlanProvider } from "@/lib/useCurrentPlan";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Whop App",
	description: "My Whop App",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				suppressHydrationWarning
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<WhopApp appearance="inherit">
					<CurrentPlanProvider>
						<div className="min-h-screen flex flex-col bg-background">
							<main className="flex-1">{children}</main>
							<AppFooter />
						</div>
					</CurrentPlanProvider>
				</WhopApp>
			</body>
		</html>
	);
}
