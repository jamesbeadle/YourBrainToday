import { armNames, type ArmName, type BenchmarkSettings } from './benchmarkTypes';
import { defaultSiteModel } from '$lib/data/siteModels';

const defaultRepeats = 1;
const defaultDocumentBudgetCharacters = 2_000_000;
const defaultArms: ArmName[] = ['documents', 'brains'];

export const helpText = `Usage: npm run benchmark -- --knowledge-base <uuid> --questions <file.json> [options]

Compares a clean model given the raw source documents with the same model
answering through the four brains. Options:

  --knowledge-base <uuid>   the knowledge base to benchmark (required)
  --questions <path>        questions file (required); see scripts/benchmark/questions.example.json
  --model <id>              the model every arm answers on (default: ${defaultSiteModel})
  --judge-model <id>        the model that scores answers (default: the answering model)
  --repeats <n>             how many times each arm answers each question (default: ${defaultRepeats})
  --arms <a,b>              which arms to run: ${armNames.join(', ')} (default: ${defaultArms.join(',')})
  --document-budget <n>     most characters of documents in one prompt (default: ${defaultDocumentBudgetCharacters})
  --help                    this text

Needs ANTHROPIC_API_KEY, SUPABASE_SECRET_KEY and PUBLIC_SUPABASE_URL in .env.
Results land in scripts/benchmark/results/<timestamp>.md and .json.`;

export function parseBenchmarkArguments(argumentList: string[]): BenchmarkSettings | 'help' {
	const options = optionsFrom(argumentList);
	if (options.has('help')) return 'help';
	const knowledgeBaseId = options.get('knowledge-base') ?? '';
	const questionsPath = options.get('questions') ?? '';
	if (knowledgeBaseId === '' || questionsPath === '') {
		throw new Error('--knowledge-base and --questions are both required; run with --help');
	}
	const model = options.get('model') ?? defaultSiteModel;
	return {
		knowledgeBaseId,
		questionsPath,
		model,
		judgeModel: options.get('judge-model') ?? model,
		repeats: positiveInteger(options.get('repeats'), defaultRepeats, 'repeats'),
		arms: armsFrom(options.get('arms')),
		documentBudgetCharacters: positiveInteger(
			options.get('document-budget'),
			defaultDocumentBudgetCharacters,
			'document-budget'
		)
	};
}

function optionsFrom(argumentList: string[]): Map<string, string> {
	const options = new Map<string, string>();
	for (let index = 0; index < argumentList.length; index += 1) {
		const argument = argumentList[index];
		if (!argument.startsWith('--')) continue;
		const next = argumentList[index + 1];
		const hasValue = next !== undefined && !next.startsWith('--');
		options.set(argument.slice(2), hasValue ? next : '');
		if (hasValue) index += 1;
	}
	return options;
}

function positiveInteger(candidate: string | undefined, fallback: number, name: string): number {
	if (candidate === undefined) return fallback;
	const parsed = Number.parseInt(candidate, 10);
	if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`--${name} must be a whole number above zero`);
	return parsed;
}

function armsFrom(candidate: string | undefined): ArmName[] {
	if (candidate === undefined) return defaultArms;
	const named = candidate.split(',').map((arm) => arm.trim());
	const unknown = named.filter((arm) => !armNames.some((known) => known === arm));
	if (unknown.length > 0) throw new Error(`Unknown arm(s): ${unknown.join(', ')}; choose from ${armNames.join(', ')}`);
	return named as ArmName[];
}
