import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { whopsdk } from "@/lib/whop-sdk";
import { NewGoalForm } from "./components/NewGoalForm";
import { GoalCard } from "./components/GoalCard";

interface GoalsPageParams {
	experienceId: string;
}

export const dynamic = "force-dynamic";

export default async function GoalsPage({
	params,
}: {
	params: Promise<GoalsPageParams>;
}) {
	const { experienceId } = await params;

	const { userId } = await whopsdk.verifyUserToken(await headers());

	const [experience, user, access] = await Promise.all([
		whopsdk.experiences.retrieve(experienceId),
		whopsdk.users.retrieve(userId),
		whopsdk.users.checkAccess(experienceId, { id: userId }),
	]);

	if (!access) {
		notFound();
	}

	const displayName = user.name || `@${user.username}`;

	// Supabase is temporarily disabled; use an empty goals list and reactions map.
	const goals: Array<{
		id: string;
		experience_id: string;
		owner_user_id: string;
		owner_name: string;
		title: string;
		completed_at: string | null;
		created_at: string;
	}> = [];

	const reactionCounts: Record<string, Record<string, number>> = {};

	return (
		<div className="min-h-full bg-gray-2 flex justify-center">
			<div className="w-full max-w-3xl px-4 py-6 md:px-8 md:py-8 space-y-6">
				<header className="space-y-2">
					<h1 className="text-9 font-semibold tracking-tight">Goals Wall</h1>
					<p className="text-3 text-gray-11">
						Set goals, keep them public, and let your community cheer you on.
					</p>
					<p className="text-2 text-gray-10">
						Signed in as <span className="font-medium">{displayName}</span>
					</p>
				</header>

				<section>
					<NewGoalForm experienceId={experienceId} ownerName={displayName} />
				</section>

				<section className="space-y-3">
					{!goals || goals.length === 0 ? (
						<p className="text-3 text-gray-11 border border-dashed border-gray-a6 rounded-lg px-4 py-6 text-center bg-gray-a2">
							No goals yet. Be the first to add one.
						</p>
					) : (
						<div className="space-y-3">
							{goals.map((goal) => (
								<GoalCard
									key={goal.id}
									goal={goal}
									currentUserId={userId}
									experienceId={experienceId}
									reactions={reactionCounts[goal.id] || {}}
								/>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
