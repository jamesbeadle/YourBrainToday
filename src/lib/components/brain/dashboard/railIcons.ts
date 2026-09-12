import type { BrainAccessRole } from '$lib/data/marketTypes';

export type SectionKey =
	| 'interview'
	| 'terminal'
	| 'sources'
	| 'model'
	| 'contents'
	| 'map'
	| 'log'
	| 'review'
	| 'share'
	| 'sell'
	| 'hive'
	| 'api'
	| 'settings';

export const readerSections: SectionKey[] = ['terminal', 'model'];

export const memberSections: SectionKey[] = ['interview', 'terminal', 'model'];

export const ownerSections: SectionKey[] = [...memberSections, 'settings'];

export const sectionsForRole: Record<BrainAccessRole, SectionKey[]> = {
	owner: ownerSections,
	collaborator: memberSections,
	reader: readerSections
};

export const sectionLabels: Record<SectionKey, string> = {
	interview: 'The interview',
	terminal: 'Terminal',
	sources: 'Source documents',
	model: 'The model',
	contents: 'Contents',
	map: 'The map',
	log: 'The log',
	review: 'Review changes',
	share: 'Sharing',
	sell: 'Sell on the market',
	hive: 'Trade Talk',
	api: 'API access',
	settings: 'Settings'
};

export const sectionIconPaths: Record<SectionKey, string[]> = {
	interview: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', 'M8 9h8', 'M8 13h5'],
	terminal: ['M4 17l6-5-6-5', 'M12 19h8'],
	sources: ['M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z', 'M14 3v5h5'],
	model: [
		'M6 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
		'M18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
		'M10 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
		'M7.6 6.2 16.2 8.6',
		'M9.4 16.4 6.6 8.9',
		'M11.8 17.2 16.8 9.8'
	],
	contents: ['M21 8v13H3V8', 'M1 3h22v5H1z', 'M10 12h4'],
	map: ['M9 20l-6-2V4l6 2 6-2 6 2v14l-6-2z', 'M9 6v14', 'M15 4v14'],
	log: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
	review: [
		'M6 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
		'M6 9v10',
		'M18 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
		'M18 15V9a4 4 0 0 0-4-4h-2',
		'M14 3l-2 2 2 2'
	],
	share: [
		'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
		'M3 20a6 6 0 0 1 12 0',
		'M18 8v6',
		'M15 11h6'
	],
	sell: [
		'M20.6 13.4 12 22l-8.6-8.6a2 2 0 0 1-.6-1.4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 1.4.6l6.4 6.4a2 2 0 0 1 0 2.8z',
		'M7.5 7.5h.01'
	],
	hive: ['M12 3l7.5 4.3v8.6L12 20.2l-7.5-4.3V7.3z', 'M12 8.2l3.3 1.9v3.8L12 15.8l-3.3-1.9v-3.8z'],
	api: ['M21 2l-9.6 9.6', 'M15.5 7.5l3 3L22 7l-3-3', 'M7.5 11a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z'],
	settings: [
		'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
		'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
	]
};
