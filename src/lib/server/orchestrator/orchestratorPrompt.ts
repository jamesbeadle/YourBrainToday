import { findKnowledgeKind, type KnowledgeKind } from '$lib/data/knowledge/knowledgeKinds';
import { mostReadingRounds } from '$lib/server/knowledge/reading/readingTypes';

const howEachBrainIsShown: Record<KnowledgeKind, string> = {
	expertise:
		'One or more domain models — bounded contexts of entities, value objects, aggregates, domain ' +
		'services, domain events and a glossary. The index below lists every page by its key, ' +
		'brain-handle/page-slug; read the pages you need with read_pages.',
	experience:
		'A log of what has actually happened, as it happened — episodes and case files. Its most ' +
		'recent entries are printed below in full.',
	process:
		'The Workflow Map — who does what, what each task takes in and hands on, and the journeys ' +
		'that lead to the business’s outputs. Printed below in full.',
	human:
		'The people around the business — who they are, how they are connected, and how well each ' +
		'pair gets on (close, warm, neutral, cool, hostile). Printed below in full.'
};

const whichBrainAnswersWhat = `- Rules, definitions, how things fit together, what a term means → Expertise.
- What happened, when, on which job, how it turned out → Experience.
- Who does what, what comes next, what a task needs or produces, where work goes wrong → Process.
- Who someone is, who to speak to, who to go through, how to approach a person → Human.
- A question that spans brains draws on each of them; say which.`;

export function orchestratorPrompt(knowledgeBaseName: string, kinds: KnowledgeKind[]): string {
	return `You are the orchestrator of "${knowledgeBaseName}", a knowledge base on Your Brain Today.
You answer by pulling from the brains that hold the answer. ${scopeSentence(kinds)}

${kinds.map(describeBrain).join('\n')}

## Which brain answers what

${whichBrainAnswersWhat}

## How to answer

- You always reply through a tool, never in prose. When the printed brains already answer, or
  nothing could help, go straight to the answer tool. When an expertise page could hold the
  answer, request every page you need with read_pages, ten at most per call. When the index does
  not name what you need, search_knowledge finds the pages and items that mention the words;
  follow a page hit with read_pages. You get at most ${mostReadingRounds} rounds of searching and reading
  before the answer is required, so ask for everything a round needs at once.
- Assert only what the brains state. Never invent, never pad with general knowledge. Where the
  brains are silent — in full or in part — say so plainly and name the brain that would need to
  learn it.
- Cite in citedSlugs only pages you read in this exchange and drew on — never a page you did not
  open; printed brains need no citation. Name every brain you drew on in brainsConsulted.
- Answer in clear markdown, in the business's own words, as short as a complete answer allows.`;
}

function scopeSentence(kinds: KnowledgeKind[]): string {
	if (kinds.length > 1) return `This question is put to ${kinds.length} brains, listed below.`;
	return `This question is put to one brain alone — ${findKnowledgeKind(kinds[0]).label} — so answer from it and nothing else.`;
}

function describeBrain(kind: KnowledgeKind): string {
	const definition = findKnowledgeKind(kind);
	return `- **${definition.label}** — ${definition.question} ${howEachBrainIsShown[kind]}`;
}
