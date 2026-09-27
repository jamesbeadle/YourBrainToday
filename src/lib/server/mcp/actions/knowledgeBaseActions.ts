import { objectSchema, readText, textField } from '../actionTypes';
import { findOwnedKnowledgeBases, sentDataReceiverFor } from './ownedKnowledgeBases';
import { ingestSentData } from '$lib/server/brain/sentData/ingestSentData';
import { readSentData } from '$lib/server/brain/sentData/sentDataRules';
import { describeSentDataOutcome } from './sentDataOutcomeSentence';
import type { McpAction } from '../actionTypes';

export const knowledgeBaseActions: McpAction[] = [
	{
		name: 'list_knowledge_bases',
		area: 'knowledge-bases',
		audience: 'everyone',
		isWrite: false,
		summary: 'Every knowledge base you own, with the id to send data to',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const knowledgeBases = await findOwnedKnowledgeBases(caller.supabase, caller.accountId);
			if (knowledgeBases.length === 0) return 'You do not own any knowledge bases yet.';
			return knowledgeBases.map((knowledgeBase) => `${knowledgeBase.name} — id ${knowledgeBase.id}`).join('\n');
		}
	},
	{
		name: 'ingest_data',
		area: 'knowledge-bases',
		audience: 'everyone',
		isWrite: true,
		summary: 'Send text into a knowledge base to train its brains; it appears in the ingested data',
		guidance:
			'The text is read like an uploaded document: the expertise model is updated, and the ' +
			'experience, process and human brains harvest what applies to them. It costs the same ' +
			'credits as uploading a document of that size. Send one coherent piece per call — a ' +
			'meeting note, an email thread, a report — with a title that says what it is.',
		inputSchema: objectSchema(
			{
				knowledge_base_id: textField('The id from list_knowledge_bases'),
				title: textField('What this data is, as it should read in the ingested data list'),
				text: textField('The text for the brain to learn from')
			},
			['knowledge_base_id', 'title', 'text']
		),
		run: async (caller, input) => {
			const receiver = await sentDataReceiverFor(
				caller.supabase,
				caller.accountId,
				readText(input, 'knowledge_base_id')
			);
			if (receiver === null) return 'No knowledge base of yours has that id — call list_knowledge_bases.';
			const sent = readSentData(input.title, input.text);
			const outcome = await ingestSentData(caller.supabase, receiver, sent, 'mcp');
			return describeSentDataOutcome(outcome);
		}
	}
];
