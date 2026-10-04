import { describe, expect, it } from 'vitest';
import { interviewSystemPrompt } from './interviewPrompt';
import { emptyWorkflowModel } from '$lib/data/workflowModel';
import type { InterviewContext } from './interviewContext';

const bareContext: InterviewContext = {
	knowledgeBaseName: 'Hartley Joinery',
	expertisePages: [],
	recentEpisodes: [],
	processNames: ['Hartley Joinery'],
	processMap: emptyWorkflowModel,
	peopleNames: []
};

describe('interviewSystemPrompt', () => {
	it('aims a process interview at the top gap of the process map', () => {
		const prompt = interviewSystemPrompt(bareContext, 'process');
		expect(prompt).toContain('## Interview agenda');
		expect(prompt).toContain('Current phase: **foundation**');
		expect(prompt).toContain('UnnamedBusiness');
		expect(prompt).toContain('## Current Process Map model');
	});

	it('lets a roaming interview follow the agenda too', () => {
		const prompt = interviewSystemPrompt(bareContext, null);
		expect(prompt).toContain('## Interview agenda');
	});

	it('keeps the agenda out of an interview focused on another brain', () => {
		const prompt = interviewSystemPrompt(bareContext, 'human');
		expect(prompt).not.toContain('## Interview agenda');
		expect(prompt).toContain('HUMAN side');
	});

	it('says nothing about the map when the knowledge base has none', () => {
		const prompt = interviewSystemPrompt({ ...bareContext, processMap: null }, 'process');
		expect(prompt).not.toContain('## Interview agenda');
	});
});
