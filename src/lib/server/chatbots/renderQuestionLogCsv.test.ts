import { describe, expect, it } from 'vitest';
import { csvFilenameFor, renderQuestionLogCsv } from './renderQuestionLogCsv';

describe('renderQuestionLogCsv', () => {
	it('quotes every cell, escapes quotes and disarms formulas', () => {
		const csv = renderQuestionLogCsv([
			{
				id: 'a1',
				askedByEmail: 'sam@site.example',
				question: 'Is the "mains" isolated?',
				answerMarkdown: '=SUM(A1)',
				citedPageKeys: ['ops/isolation', 'ops/glossary'],
				askedAt: '2026-09-28T10:00:00+00:00',
				hasPreferredAnswer: true
			}
		]);
		const [header, row] = csv.trimEnd().split('\r\n');
		expect(header).toBe('"asked_at","asked_by","question","answer","cited_pages","has_preferred_answer"');
		expect(row).toBe(
			'"2026-09-28T10:00:00+00:00","sam@site.example","Is the ""mains"" isolated?","\'=SUM(A1)","ops/isolation ops/glossary","yes"'
		);
	});

	it('names the file after the bot', () => {
		expect(csvFilenameFor('Site Crew Bot!')).toBe('site-crew-bot-questions.csv');
		expect(csvFilenameFor('???')).toBe('chatbot-questions.csv');
	});
});
