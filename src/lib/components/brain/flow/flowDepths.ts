import type { EdgeSeed } from './flowEdges';
import type { FlowNode } from './flowTypes';

export function depthsOf(nodes: FlowNode[], seeds: EdgeSeed[]): Map<string, number> {
	const depths = new Map(nodes.map((node) => [node.id, node.kind === 'source' ? 0 : 1]));
	const carried = seeds.filter((seed) => seed.kind === 'flow' || seed.kind === 'handover');
	for (let pass = 0; pass < nodes.length; pass += 1) {
		let hasDeepened = false;
		for (const seed of carried) {
			const deeper = (depths.get(seed.fromId) ?? 0) + 1;
			if (deeper <= (depths.get(seed.toId) ?? 0) || deeper > nodes.length) continue;
			depths.set(seed.toId, deeper);
			hasDeepened = true;
		}
		if (!hasDeepened) break;
	}
	return depths;
}
