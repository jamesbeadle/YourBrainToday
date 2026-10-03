import { searchKnowledgeHits, type KnowledgeSearchHit } from './searchKnowledgeHits';

/** The body search: asked on Enter, answered with ranked hits, forgotten when the box empties. */
export class KnowledgeSearch {
	#knowledgeBaseId: () => string;
	#brainNameFor: (brainId: string) => string;
	hits = $state<KnowledgeSearchHit[] | null>(null);
	searchedText = $state('');
	isSearching = $state(false);
	failure = $state<string | null>(null);

	constructor(knowledgeBaseId: () => string, brainNameFor: (brainId: string) => string) {
		this.#knowledgeBaseId = knowledgeBaseId;
		this.#brainNameFor = brainNameFor;
	}

	get hasAnswer(): boolean {
		return this.hits !== null;
	}

	async ask(text: string): Promise<void> {
		const query = text.trim();
		if (query === '') return this.forget();
		this.isSearching = true;
		this.failure = null;
		try {
			this.hits = await searchKnowledgeHits(this.#knowledgeBaseId(), query, this.#brainNameFor);
			this.searchedText = query;
		} catch (caught) {
			this.failure = caught instanceof Error ? caught.message : 'The search did not answer';
		} finally {
			this.isSearching = false;
		}
	}

	forget(): void {
		this.hits = null;
		this.searchedText = '';
		this.failure = null;
	}
}
