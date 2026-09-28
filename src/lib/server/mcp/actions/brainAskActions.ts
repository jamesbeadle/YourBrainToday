import { describeQuestionOutcome } from './questionOutcomeSentence';
import { knowledgeBaseIdField, onOwnedKnowledgeBase } from './ownedKnowledgeBases';
import { objectSchema, readText, textField } from '../actionTypes';
import { askKnowledgeBaseAndSettle } from '$lib/server/orchestrator/askKnowledgeBaseAndSettle';
import { everyKnowledgeKind, isKnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import type { McpAction } from '../actionTypes';

const questionField = textField('One clear question, in plain words');

const brainField = {
	type: 'string',
	enum: everyKnowledgeKind,
	description: 'Which brain to ask: expertise, experience, process or human'
};

const costGuidance =
	'Spends the owner’s credits like a question asked on the site. Ask one question per call; ' +
	'when you need detail rather than an answer, read the brains yourself with the read_ ' +
	'actions, which are free.';

export const brainAskActions: McpAction[] = [
	{
		name: 'ask_knowledge_base',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: 'Ask a knowledge base — the orchestrator answers from whichever of its four brains hold it',
		guidance: costGuidance,
		inputSchema: objectSchema(
			{ knowledge_base_id: knowledgeBaseIdField, question: questionField },
			['knowledge_base_id', 'question']
		),
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase, input) => {
			const outcome = await askKnowledgeBaseAndSettle(
				caller.supabase,
				knowledgeBase,
				readText(input, 'question'),
				everyKnowledgeKind,
				'mcp'
			);
			return describeQuestionOutcome(outcome);
		})
	},
	{
		name: 'ask_brain',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: 'Ask one brain alone — expertise, experience, process or human',
		guidance: costGuidance,
		inputSchema: objectSchema(
			{ knowledge_base_id: knowledgeBaseIdField, brain: brainField, question: questionField },
			['knowledge_base_id', 'brain', 'question']
		),
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase, input) => {
			const brain = readText(input, 'brain');
			if (!isKnowledgeKind(brain)) return `brain must be one of: ${everyKnowledgeKind.join(', ')}.`;
			const outcome = await askKnowledgeBaseAndSettle(
				caller.supabase,
				knowledgeBase,
				readText(input, 'question'),
				[brain],
				'mcp'
			);
			return describeQuestionOutcome(outcome);
		})
	}
];
