import { Button } from "@whop/react/components";
import Link from "next/link";

export default function Page() {
	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 sm:px-6 lg:px-8">
			<div className="max-w-2xl w-full mx-auto rounded-2xl bg-card/70 text-card-foreground backdrop-blur-2xl border border-border shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] transition-[box-shadow,transform,background-color] duration-300 hover:bg-card hover:-translate-y-0.5 px-6 py-8 sm:px-8 sm:py-10">
				<div className="text-center mb-8">
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
						Welcome to Your Whop App
					</h1>
					<p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
						Learn how to build your application on our docs
					</p>
				</div>

				<div className="flex justify-center w-full">
					<Link
						href="https://docs.whop.com/apps"
						className="w-full sm:w-auto"
						target="_blank"
					>
						<Button
							variant="classic"
							size="4"
							className="w-full sm:w-auto h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
						>
							Developer Docs
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
