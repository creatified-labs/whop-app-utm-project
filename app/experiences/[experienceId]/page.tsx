import { redirect } from "next/navigation";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;

	// Redirect the default experience view to the Goals Wall.
	redirect(`/experiences/${experienceId}/goals`);
}
