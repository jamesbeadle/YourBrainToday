import { dataFrom } from '$lib/components/knowledge/editors/editorFields';
import type { CaseGroup } from '$lib/components/knowledge/editors/caseGrouping';
import type { KbBrainItem } from '$lib/data/knowledge/knowledgeTypes';

const UNFILED_REGION_ID = 'unfiled';
const DORMANT_REGION_ID = 'dormant';

export type RegionSeed = {
	id: string;
	name: string;
	caption: string;
	isUnfiled: boolean;
	episodes: KbBrainItem[];
};

export function seedFromCase(group: CaseGroup): RegionSeed {
	const status = dataFrom(group.caseFile, 'status');
	const count = episodeCountLabel(group.episodes.length);
	return {
		id: group.caseFile.id,
		name: group.caseFile.title,
		caption: status === '' ? count : `${count} · ${status}`,
		isUnfiled: false,
		episodes: group.episodes
	};
}

export function unfiledSeed(episodes: KbBrainItem[]): RegionSeed {
	return {
		id: UNFILED_REGION_ID,
		name: 'Unfiled',
		caption: `${episodeCountLabel(episodes.length)} not yet in a case`,
		isUnfiled: true,
		episodes
	};
}

export function dormantSeed(): RegionSeed {
	return {
		id: DORMANT_REGION_ID,
		name: 'Nothing filed yet',
		caption: 'the interview fills this brain',
		isUnfiled: true,
		episodes: []
	};
}

function episodeCountLabel(count: number): string {
	return `${count} ${count === 1 ? 'episode' : 'episodes'}`;
}
