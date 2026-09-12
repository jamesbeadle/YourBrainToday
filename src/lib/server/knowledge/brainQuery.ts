import { kindForCategory } from '$lib/data/knowledge/knowledgeKinds';
import { requestAnthropic } from '$lib/server/anthropic/requestAnthropic';
import { textFrom } from '$lib/server/anthropic/anthropicTypes';
import type { KbBrainItem, KbBrainSummary } from '$lib/data/knowledge/knowledgeTypes';

const itemLimit = 250;
const bodyLimit = 400;
const maxAnswerTokens = 700;

export async function answerBrainQuestion(
	brain: KbBrainSummary,
	items: KbBrainItem[],
	question: string
): Promise<string> {
	const response = await requestAnthropic({
		system: querySystemPrompt(brain, items),
		messages: [{ role: 'user', content: question }],
		tools: [],
		maxTokens: maxAnswerTokens
	});
	return textFrom(response) || 'This brain holds nothing that answers that yet.';
}

function querySystemPrompt(brain: KbBrainSummary, items: KbBrainItem[]): string {
	const kind = kindForCategory(brain.category);
	return `You answer questions from one second brain of a business — "${brain.name}"
(${kind.label} knowledge: ${kind.question}).

Answer ONLY from the records below. When the records do not hold the answer, say so
plainly — never invent. Keep answers short and concrete, in the trade's own vocabulary,
naming the records you drew on.

## Records

${renderItems(items)}`;
}

function renderItems(items: KbBrainItem[]): string {
	if (items.length === 0) return '(this brain is empty)';
	const caseTitles = new Map(
		items.filter((item) => item.itemKind === 'case').map((item) => [item.id, item.title])
	);
	return items
		.slice(0, itemLimit)
		.map((item) => renderItem(item, caseTitles))
		.join('\n');
}

function renderItem(item: KbBrainItem, caseTitles: Map<string, string>): string {
	const parts = [`- [${item.itemKind}] ${item.title}`];
	if (item.occurredAt !== null) parts.push(`(${item.occurredAt.slice(0, 10)})`);
	const caseTitle = item.parentItemId === null ? undefined : caseTitles.get(item.parentItemId);
	if (caseTitle !== undefined) parts.push(`[case: ${caseTitle}]`);
	if (item.body !== '') parts.push(`— ${item.body.slice(0, bodyLimit)}`);
	const frame = caseFrame(item);
	if (frame !== '') parts.push(frame);
	return parts.join(' ');
}

function caseFrame(item: KbBrainItem): string {
	if (item.itemKind !== 'case') return '';
	const fields = ['problem', 'approach', 'outcome', 'status']
		.map((key) => [key, item.data[key]])
		.filter(([, value]) => typeof value === 'string' && value !== '')
		.map(([key, value]) => `${key}: ${value}`);
	return fields.length === 0 ? '' : `— ${fields.join('; ')}`;
}
