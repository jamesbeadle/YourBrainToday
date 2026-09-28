import { findKnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { KnowledgeBaseQuestionOutcome } from '$lib/server/orchestrator/askKnowledgeBaseAndSettle';

export function describeQuestionOutcome(outcome: KnowledgeBaseQuestionOutcome): string {
	if (outcome.status === 'rejected') return outcome.message;
	if (outcome.status === 'failed') return outcome.message;
	if (outcome.status === 'out_of_credits') {
		return 'You are out of credits — top up on the site, then ask again.';
	}
	if (outcome.status === 'account_restricted') return 'This account is currently restricted.';
	const { answer } = outcome;
	const brains = answer.brainsConsulted.map((kind) => findKnowledgeKind(kind).label);
	return [
		answer.answerMarkdown,
		'',
		brains.length === 0 ? 'Drawn from: none of the brains covered it.' : `Drawn from: ${brains.join(', ')}.`,
		answer.citedPageKeys.length === 0 ? null : `Pages cited: ${answer.citedPageKeys.join(', ')}.`,
		`Credits left: ${outcome.creditBalance.toLocaleString('en-GB')}.`
	]
		.filter((line) => line !== null)
		.join('\n');
}
