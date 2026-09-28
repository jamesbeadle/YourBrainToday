import type { ChatbotExchange } from '$lib/data/chatbotQuestionLog';

const columns = ['asked_at', 'asked_by', 'question', 'answer', 'cited_pages', 'has_preferred_answer'];
const rowBreak = '\r\n';
const formulaStarters = /^[=+\-@]/;

export function renderQuestionLogCsv(exchanges: ChatbotExchange[]): string {
	const rows = exchanges.map((exchange) => [
		exchange.askedAt,
		exchange.askedByEmail ?? '',
		exchange.question,
		exchange.answerMarkdown,
		exchange.citedPageKeys.join(' '),
		exchange.hasPreferredAnswer ? 'yes' : 'no'
	]);
	return [columns, ...rows].map((row) => row.map(csvCell).join(',')).join(rowBreak) + rowBreak;
}

export function csvFilenameFor(chatbotName: string): string {
	const stem = chatbotName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	return `${stem || 'chatbot'}-questions.csv`;
}

// A cell that a spreadsheet would read as a formula is quoted with a leading
// apostrophe, so a member's question can never run in the manager's Excel.
function csvCell(value: string): string {
	const safe = formulaStarters.test(value) ? `'${value}` : value;
	return `"${safe.replace(/"/g, '""')}"`;
}
