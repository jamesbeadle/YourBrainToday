import { dataFrom, dataListFrom } from './editorFields';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

export type CaseGroup = { caseFile: KbBrainItem; episodes: KbBrainItem[] };

export type GroupedExperience = { caseGroups: CaseGroup[]; caselessEpisodes: KbBrainItem[] };

export function groupByCases(items: KbBrainItem[]): GroupedExperience {
	const episodes = items
		.filter((item) => item.itemKind === 'episode')
		.toSorted((first, second) => momentOf(second).localeCompare(momentOf(first)));
	const caseFiles = items.filter((item) => item.itemKind === 'case');
	const caseIds = new Set(caseFiles.map((caseFile) => caseFile.id));
	return {
		caseGroups: caseFiles
			.map((caseFile) => ({
				caseFile,
				episodes: episodes.filter((episode) => episode.parentItemId === caseFile.id)
			}))
			.toSorted((first, second) => latestMoment(second).localeCompare(latestMoment(first))),
		caselessEpisodes: episodes.filter(
			(episode) => episode.parentItemId === null || !caseIds.has(episode.parentItemId)
		)
	};
}

export function momentOf(episode: KbBrainItem): string {
	return episode.occurredAt ?? episode.createdAt;
}

export function episodeDetail(episode: KbBrainItem): string {
	const parts = [new Date(momentOf(episode)).toLocaleString()];
	const provenance = dataFrom(episode, 'provenance');
	if (provenance !== '') parts.push(provenance);
	const newTerms = dataListFrom(episode, 'newTerms');
	if (newTerms.length > 0) parts.push(`new terms: ${newTerms.join(', ')}`);
	return parts.join(' · ');
}

function latestMoment(group: CaseGroup): string {
	return group.episodes[0] === undefined ? group.caseFile.createdAt : momentOf(group.episodes[0]);
}
