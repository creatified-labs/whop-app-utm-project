"use client";

import { useEffect, useState, useTransition } from "react";
import { NewGoalForm } from "./NewGoalForm";
import { GoalCard } from "./GoalCard";

export interface Goal {
	id: string;
	experience_id: string;
	owner_user_id: string;
	owner_name: string;
	title: string;
	completed_at: string | null;
	created_at: string;
}

export type GoalReactions = Record<string, Record<string, number>>;

interface GoalsWallClientProps {
	experienceId: string;
	currentUserId: string;
	displayName: string;
}

const STORAGE_KEY_PREFIX = "goals-wall:";

export function GoalsWallClient({
	experienceId,
	currentUserId,
	displayName,
}: GoalsWallClientProps) {
	const storageKey = `${STORAGE_KEY_PREFIX}${experienceId}`;
	const [goals, setGoals] = useState<Goal[]>([]);
	const [reactions, setReactions] = useState<GoalReactions>({});
	const [isHydrated, setIsHydrated] = useState(false);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		if (typeof window === "undefined") return;
		try {
			const raw = window.localStorage.getItem(storageKey);
			if (raw) {
				const parsed = JSON.parse(raw) as {
					goals?: Goal[];
					reactions?: GoalReactions;
				};
				if (parsed.goals) setGoals(parsed.goals);
				if (parsed.reactions) setReactions(parsed.reactions);
			}
		} catch {
			// ignore parse errors; start fresh
		}
		setIsHydrated(true);
	}, [storageKey]);

	const persist = (nextGoals: Goal[], nextReactions: GoalReactions) => {
		setGoals(nextGoals);
		setReactions(nextReactions);
		if (typeof window === "undefined") return;
		try {
			window.localStorage.setItem(
				storageKey,
				JSON.stringify({ goals: nextGoals, reactions: nextReactions }),
			);
		} catch {
			// ignore quota errors
		}
	};

	const handleCreateGoal = (title: string) => {
		startTransition(() => {
			const now = new Date().toISOString();
			const newGoal: Goal = {
				id: crypto.randomUUID(),
				experience_id: experienceId,
				owner_user_id: currentUserId,
				owner_name: displayName,
				title,
				completed_at: null,
				created_at: now,
			};
			const nextGoals = [...goals, newGoal];
			persist(nextGoals, reactions);
		});
	};

	const handleToggleGoalCompleted = (goalId: string) => {
		startTransition(() => {
			const nextGoals = goals.map((g) =>
				g.id === goalId
					? {
						...g,
						completed_at: g.completed_at ? null : new Date().toISOString(),
					}
					: g,
			);
			persist(nextGoals, reactions);
		});
	};

	const handleAddReaction = (goalId: string, emoji: string) => {
		startTransition(() => {
			const goalReactions = reactions[goalId] || {};
			const current = goalReactions[emoji] || 0;
			// Single-user local testing: treat as toggle 0/1
			const nextCount = current === 0 ? 1 : 0;
			const nextGoalReactions = {
				...goalReactions,
				[emoji]: nextCount,
			};
			const nextReactions: GoalReactions = {
				...reactions,
				[goalId]: nextGoalReactions,
			};
			persist(goals, nextReactions);
		});
	};

	return (
		<section className="space-y-3">
			<NewGoalForm
				experienceId={experienceId}
				ownerName={displayName}
				onCreate={handleCreateGoal}
				isPending={isPending}
			/>
			<div className="space-y-3">
				{(!isHydrated || goals.length === 0) && (
					<p className="text-3 text-gray-11 border border-dashed border-gray-a6 rounded-lg px-4 py-6 text-center bg-gray-a2">
						No goals yet. Be the first to add one.
					</p>
				)}
				{isHydrated &&
					goals.length > 0 &&
					goals.map((goal) => (
						<GoalCard
							key={goal.id}
							goal={goal}
							currentUserId={currentUserId}
							experienceId={experienceId}
							reactions={reactions[goal.id] || {}}
							onToggle={handleToggleGoalCompleted}
							onReact={handleAddReaction}
						/>
					))}
			</div>
		</section>
	);
}
