import { describe, expect, it } from 'vitest';
import { parseConnections, parsePeople } from './parseHumanHarvest';

describe('parsePeople', () => {
	it('keeps named people and drops anyone without a name', () => {
		const people = parsePeople([
			{ name: ' Sarah Hartley ', role: 'Client PM', organisation: 'Hartley Homes' },
			{ role: 'the architect' },
			'not a person'
		]);
		expect(people).toEqual([
			{ name: 'Sarah Hartley', role: 'Client PM', organisation: 'Hartley Homes', note: '' }
		]);
	});
});

describe('parseConnections', () => {
	it('reads how well two people get on', () => {
		const [connection] = parseConnections([
			{
				from: 'Dave',
				to: 'Sarah',
				relationship: 'fell out with',
				warmth: 'hostile',
				note: 'Hartley job'
			}
		]);
		expect(connection.warmth).toBe('hostile');
	});

	it('treats an unstated or unknown warmth as neutral', () => {
		const connections = parseConnections([
			{ from: 'Dave', to: 'Sarah', relationship: 'works with' },
			{ from: 'Dave', to: 'Priya', relationship: 'works with', warmth: 'lukewarm' }
		]);
		expect(connections.map((connection) => connection.warmth)).toEqual(['neutral', 'neutral']);
	});

	it('drops connections missing an end, a relationship, or joining someone to themselves', () => {
		const connections = parseConnections([
			{ from: 'Dave', relationship: 'works with' },
			{ from: 'Dave', to: 'Sarah' },
			{ from: 'Dave', to: 'dave', relationship: 'is' }
		]);
		expect(connections).toEqual([]);
	});
});
