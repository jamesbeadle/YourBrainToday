import { describe, expect, it } from 'vitest';
import { parseHarvest } from './parseHarvest';

describe('parseHarvest', () => {
	it('keeps an event dated to the day', () => {
		const harvest = parseHarvest({
			experienceEvents: [{ title: 'Handover signed off', occurredAt: '2026-05-14' }]
		});
		expect(harvest.experienceEvents[0].occurredAt).toBe('2026-05-14T00:00:00.000Z');
	});

	it('files an event dated only to the month as undated, rather than failing the reading', () => {
		const harvest = parseHarvest({
			experienceEvents: [{ title: 'Handover signed off', occurredAt: '2026-05' }]
		});
		expect(harvest.experienceEvents[0].occurredAt).toBeNull();
	});
});
