export default function DiscoverPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="max-w-4xl mx-auto px-4 py-12 md:py-16 space-y-10">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
					Discover your app
				</h1>
				<div className="rounded-2xl bg-card/70 text-card-foreground backdrop-blur-2xl border border-border shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] transition-[box-shadow,transform,background-color] duration-300 hover:bg-card hover:-translate-y-0.5 p-6 md:p-8 text-center space-y-3">
					<p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
						This is your app's discover page—showcase what your app does and how it helps
						creators.
					</p>
					<p className="text-sm text-muted-foreground max-w-2xl mx-auto">
						Share real success stories, link to thriving Whop communities using your app,
						and add referral links to earn affiliate fees when people install your app.
					</p>
					<p className="text-xs text-muted-foreground max-w-2xl mx-auto">
						💡 <strong>Tip:</strong> Clearly explain your app's value proposition and how it
						helps creators make money or grow their communities.
					</p>
				</div>

				{/* Pro Tips Section */}
				<div className="grid md:grid-cols-2 gap-6 mb-10">
					<div className="rounded-2xl bg-card/70 text-card-foreground backdrop-blur-2xl border border-border shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] transition-[box-shadow,transform,background-color] duration-300 hover:bg-card p-5 flex flex-col gap-2">
						<h3 className="text-sm font-semibold text-foreground">
							Showcase Real Success
						</h3>
						<p className="text-sm text-muted-foreground">
							Link to real Whop communities using your app, with revenue and member stats.
						</p>
					</div>
					<div className="rounded-2xl bg-card/70 text-card-foreground backdrop-blur-2xl border border-border shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] transition-[box-shadow,transform,background-color] duration-300 hover:bg-card p-5 flex flex-col gap-2">
						<h3 className="text-sm font-semibold text-foreground">
							Include Referral Links
						</h3>
						<p className="text-sm text-muted-foreground">
							Add <code>?a=your_app_id</code> to Whop links to earn affiliate commissions.
						</p>
					</div>
				</div>

				<h2 className="text-xl md:text-2xl font-semibold tracking-tight text-center">
					Examples of Success Stories
				</h2>

				{/* Main Content Cards */}
				<div className="grid md:grid-cols-2 gap-6">
					{/* Success Story Card 1 */}
					<div className="rounded-2xl bg-card/70 text-card-foreground backdrop-blur-2xl border border-border shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] transition-[box-shadow,transform,background-color] duration-300 hover:bg-card p-6 flex flex-col justify-between">
						<div>
							<h3 className="text-base font-semibold text-foreground mb-1">
								CryptoKings
							</h3>
							<p className="text-xs text-muted-foreground mb-2">
								Trading Community
							</p>
							<p className="text-sm text-muted-foreground mb-4">
								"Grew to{" "}
								<span className="font-semibold text-primary">
									2,500+ members
								</span>{" "}
								and{" "}
								<span className="font-semibold text-primary">
									$18,000+/mo
								</span>{" "}
								with automated signals. Members love the real-time alerts!"
							</p>
						</div>
						<a
							href="https://whop.com/cryptokings/?a=your_app_id"
							className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 px-4 transition-colors hover:bg-primary/90"
						>
							Visit CryptoKings
						</a>
					</div>

					{/* Success Story Card 2 */}
					<div className="rounded-2xl bg-card/70 text-card-foreground backdrop-blur-2xl border border-border shadow-[var(--glass-shadow)] hover:shadow-[var(--glass-shadow-hover)] transition-[box-shadow,transform,background-color] duration-300 hover:bg-card p-6 flex flex-col justify-between">
						<div>
							<h3 className="text-base font-semibold text-foreground mb-1">
								SignalPro
							</h3>
							<p className="text-xs text-muted-foreground mb-2">
								Premium Signals
							</p>
							<p className="text-sm text-muted-foreground mb-4">
								"Retention jumped to{" "}
								<span className="font-semibold text-primary">92%</span>.
								Affiliate program brought in{" "}
								<span className="font-semibold text-primary">$4,000+</span>{" "}
								last quarter."
							</p>
						</div>
						<a
							href="https://whop.com/signalpro/?app=your_app_id"
							className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium py-2.5 px-4 transition-colors hover:bg-primary/90"
						>
							Visit SignalPro
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
