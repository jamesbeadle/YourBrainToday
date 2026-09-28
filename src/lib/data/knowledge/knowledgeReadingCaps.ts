// How much of each brain an agent is shown at every question, so the prompt
// stays bounded however large the knowledge base grows.
export const knowledgeReadingCaps = {
	longestExpertiseIndex: 20_000,
	mostExperienceItems: 40,
	longestExperienceEntry: 280,
	longestExperienceSection: 10_000,
	mostProcessMaps: 3,
	mostTasksPerRole: 15,
	longestTaskSummary: 160,
	longestProcessSection: 12_000,
	mostHumanItems: 120,
	longestHumanNote: 200,
	longestHumanSection: 8_000
} as const;
