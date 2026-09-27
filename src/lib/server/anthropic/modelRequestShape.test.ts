import { describe, expect, it } from 'vitest';
import { shapeRequestForModel } from './modelRequestShape';

const opusFiveFive = 'claude-opus-5-5';
const haiku = 'claude-haiku-4-5';
const baseRequest = { system: 'You are the Modeller.', maxTokens: 4000 };

describe('shapeRequestForModel', () => {
	it('forces the tool on a model that allows it', () => {
		const shaped = shapeRequestForModel(haiku, { ...baseRequest, forcedToolName: 'answer' });
		expect(shaped.tool_choice).toEqual({ type: 'tool', name: 'answer' });
		expect(shaped.system).toBe(baseRequest.system);
		expect(shaped.max_tokens).toBe(baseRequest.maxTokens);
		expect(shaped.output_config).toBeUndefined();
	});

	it('asks for the tool in the system prompt on Opus 5.5, which refuses a forced choice', () => {
		const shaped = shapeRequestForModel(opusFiveFive, { ...baseRequest, forcedToolName: 'answer' });
		expect(shaped.tool_choice).toBeUndefined();
		expect(shaped.system).toContain('calling the answer tool');
	});

	it('runs Opus 5.5 at medium effort with room to think', () => {
		const shaped = shapeRequestForModel(opusFiveFive, baseRequest);
		expect(shaped.output_config).toEqual({ effort: 'medium' });
		expect(shaped.max_tokens).toBeGreaterThan(baseRequest.maxTokens);
		expect(shaped.system).toBe(baseRequest.system);
	});

	it('asks for any tool when one must be used but none is named', () => {
		const shaped = shapeRequestForModel(opusFiveFive, { ...baseRequest, mustUseTool: true });
		expect(shaped.system).toContain('one of your tools');
	});
});
