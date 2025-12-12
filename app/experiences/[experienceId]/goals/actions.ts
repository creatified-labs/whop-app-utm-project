'use server';

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { whopsdk } from "@/lib/whop-sdk";

export async function createGoal(formData: FormData) {
	const experienceId = formData.get("experienceId");
	const title = (formData.get("title") || "").toString().trim();

	if (typeof experienceId !== "string" || !experienceId) {
		throw new Error("Missing experienceId");
	}

	if (!title) {
		throw new Error("Title is required");
	}

	const { userId } = await whopsdk.verifyUserToken(await headers());

	revalidatePath(`/experiences/${experienceId}/goals`);
}

export async function toggleGoalCompleted(goalId: string, experienceId: string) {
	const { userId } = await whopsdk.verifyUserToken(await headers());

	revalidatePath(`/experiences/${experienceId}/goals`);
}

export async function addReaction(goalId: string, emoji: string, experienceId: string) {
	const { userId } = await whopsdk.verifyUserToken(await headers());

	revalidatePath(`/experiences/${experienceId}/goals`);
}
