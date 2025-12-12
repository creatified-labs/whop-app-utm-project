"use client";

import { useState, useTransition } from "react";
import { Button } from "@whop/react/components";

interface NewGoalFormProps {
	experienceId: string;
	ownerName: string;
	onCreate: (title: string) => void;
	isPending?: boolean;
}

export function NewGoalForm({ experienceId, onCreate, isPending: externalPending }: NewGoalFormProps) {
	const [title, setTitle] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPendingInternal, startTransition] = useTransition();
	const isPending = externalPending ?? isPendingInternal;

	return (
		<form
			className="border border-gray-a5 rounded-xl bg-gray-1 shadow-xs px-4 py-4 space-y-3"
			action={async (formData) => {
				startTransition(async () => {
					setError(null);
					const value = title.trim();
					if (!value) {
						setError("Please enter a goal title.");
						return;
					}
					try {
						onCreate(value);
						setTitle("");
					} catch (e) {
						setError("Something went wrong while creating the goal.");
					}
				});
			}}
		>
			<div className="space-y-2">
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="What goal are you working toward?"
					className="w-full rounded-lg border border-gray-a6 bg-gray-1 px-3 py-2 text-3 text-gray-12 outline-none focus:ring-2 focus:ring-gray-9 focus:border-gray-9"
				/>
				<div className="flex justify-end pt-1">
					<Button
						type="submit"
						variant="classic"
						size="2"
						className="px-4"
						disabled={isPending}
					>
						{isPending ? "Adding..." : "Add goal"}
					</Button>
				</div>
				{error && (
						<p className="text-2 text-red-11" role="alert">
							{error}
						</p>
					)}
			</div>
		</form>
	);
}
