"use client";

import { useTransition } from "react";
import { Button } from "@whop/react/components";

const EMOJIS = ["👍", "❤️", "🔥", "✅"];

interface Goal {
	id: string;
	experience_id: string;
	owner_user_id: string;
	owner_name: string;
	title: string;
	completed_at: string | null;
	created_at: string;
}

interface GoalCardProps {
	goal: Goal;
	currentUserId: string;
	experienceId: string;
	reactions: Record<string, number>;
	onToggle: (goalId: string) => void;
	onReact: (goalId: string, emoji: string) => void;
}

export function GoalCard({ goal, currentUserId, experienceId, reactions, onToggle, onReact }: GoalCardProps) {
	const [isToggling, startToggle] = useTransition();
	const [isReacting, startReact] = useTransition();

	const isOwner = goal.owner_user_id === currentUserId;
	const isCompleted = !!goal.completed_at;
	const createdDate = new Date(goal.created_at).toLocaleDateString();

	return (
		<div
			className={`border border-gray-a5 rounded-xl bg-gray-1 shadow-xs px-4 py-3 space-y-2 ${
				isCompleted ? "opacity-80" : ""
			}`}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="space-y-1">
					<p className="text-2 text-gray-10">
						<span className="font-medium text-gray-12">{goal.owner_name}</span>
						<span className="mx-1 text-gray-9">·</span>
						<span>{createdDate}</span>
					</p>
					<p
						className={`text-3 ${
							isCompleted ? "line-through text-gray-10" : "text-gray-12"
						}`}
					>
						{goal.title}
					</p>
				</div>
				<div className="flex items-center gap-2">
					{isCompleted && (
						<span className="inline-flex items-center rounded-full border border-green-a6 bg-green-a3 px-2 py-0.5 text-2 font-medium text-green-11">
							Completed
						</span>
					)}
					{isOwner && (
						<Button
							variant="classic"
							size="1"
							className="text-2 px-2"
							onClick={() => {
								startToggle(async () => {
									onToggle(goal.id);
								});
							}}
							disabled={isToggling}
						>
							{isCompleted ? "Mark as active" : "Mark done"}
						</Button>
					)}
				</div>
			</div>
			<div className="flex items-center gap-2 pt-1">
				{EMOJIS.map((emoji) => {
					const count = reactions[emoji] || 0;
					return (
						<button
							key={emoji}
							type="button"
							onClick={() => {
								startReact(async () => {
									await addReaction(goal.id, emoji, experienceId);
								});
							}}
							disabled={isReacting}
							className="inline-flex items-center gap-1 rounded-full border border-gray-a5 bg-gray-1 px-2 py-0.5 text-2 text-gray-11 hover:bg-gray-3 transition-colors"
						>
							<span>{emoji}</span>
							{count > 0 && <span className="text-1 text-gray-10">{count}</span>}
						</button>
					);
				})}
			</div>
		</div>
	);
}
