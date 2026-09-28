import { knowledgeBaseIdField, onOwnedKnowledgeBase } from './ownedKnowledgeBases';
import { objectSchema } from '../actionTypes';
import { describeReadingAsLines } from '$lib/server/knowledge/reading/describeReading';
import { readKnowledgeBase } from '$lib/server/knowledge/reading/readKnowledgeBase';
import { renderExperienceEntries } from '$lib/server/knowledge/reading/renderExperienceEntries';
import { renderPeople } from '$lib/server/knowledge/reading/renderPeople';
import { renderProcessMaps } from '$lib/server/knowledge/reading/renderProcessMaps';
import type { McpAction } from '../actionTypes';

const knowledgeBaseInput = objectSchema({ knowledge_base_id: knowledgeBaseIdField }, ['knowledge_base_id']);

export const brainReadActions: McpAction[] = [
	{
		name: 'describe_knowledge_base',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: 'The four brains of one knowledge base — what each answers and how much it holds',
		guidance:
			'Read this first for a knowledge base you have not worked with. Then either ask it ' +
			'(ask_knowledge_base, ask_brain — these spend credits) or read a brain yourself with the ' +
			'read_ actions, which are free.',
		inputSchema: knowledgeBaseInput,
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase) => {
			const reading = await readKnowledgeBase(caller.supabase, knowledgeBase.id);
			return [
				`${knowledgeBase.name} — id ${knowledgeBase.id}`,
				knowledgeBase.description === '' ? null : knowledgeBase.description,
				'',
				describeReadingAsLines(reading)
			]
				.filter((line) => line !== null)
				.join('\n');
		})
	},
	{
		name: 'read_experience',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: 'The experience brain — what has actually happened, newest first',
		inputSchema: knowledgeBaseInput,
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase) => {
			const reading = await readKnowledgeBase(caller.supabase, knowledgeBase.id, ['experience']);
			return renderExperienceEntries(reading.experience);
		})
	},
	{
		name: 'read_process_map',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: 'The process brain — who does what, what each task takes in and hands on',
		inputSchema: knowledgeBaseInput,
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase) => {
			const reading = await readKnowledgeBase(caller.supabase, knowledgeBase.id, ['process']);
			return renderProcessMaps(reading.processMaps);
		})
	},
	{
		name: 'read_people',
		area: 'brains',
		audience: 'everyone',
		isWrite: false,
		summary: 'The human brain — the people around the business and how well each pair gets on',
		inputSchema: knowledgeBaseInput,
		run: onOwnedKnowledgeBase(async (caller, knowledgeBase) => {
			const reading = await readKnowledgeBase(caller.supabase, knowledgeBase.id, ['human']);
			return renderPeople(reading.people);
		})
	}
];
