import { shareStreamFrom } from '$lib/components/brain/constellation/pseudoRandom';

export type GlyphNode = { x: number; y: number; radius: number };
export type GlyphEdge = { from: GlyphNode; to: GlyphNode };
export type GlyphLayout = { nodes: GlyphNode[]; edges: GlyphEdge[] };

const NODE_COUNT = 11;
const CENTRE = 50;
const LOBE_WIDTH = 40;
const LOBE_HEIGHT = 30;
const STEM_DROP = 8;
const MINIMUM_RADIUS = 1.6;
const RADIUS_SPREAD = 2.6;
const NEIGHBOUR_LINKS = 2;

export function buildGlyphLayout(seed: string): GlyphLayout {
	const nextShare = shareStreamFrom(seed);
	const nodes = Array.from({ length: NODE_COUNT }, () => placeNode(nextShare));
	return { nodes, edges: linkNearestNeighbours(nodes) };
}

function placeNode(nextShare: () => number): GlyphNode {
	const angle = nextShare() * Math.PI * 2;
	const reach = Math.sqrt(nextShare());
	const x = CENTRE + Math.cos(angle) * reach * LOBE_WIDTH;
	const y = CENTRE - STEM_DROP + Math.sin(angle) * reach * LOBE_HEIGHT + swellTowardTop(angle);
	return { x, y, radius: MINIMUM_RADIUS + nextShare() * RADIUS_SPREAD };
}

function swellTowardTop(angle: number): number {
	return Math.sin(angle) < 0 ? -4 : 0;
}

function linkNearestNeighbours(nodes: GlyphNode[]): GlyphEdge[] {
	const edges: GlyphEdge[] = [];
	for (const node of nodes) {
		for (const neighbour of nearestNeighboursOf(node, nodes)) {
			if (hasEdge(edges, node, neighbour)) continue;
			edges.push({ from: node, to: neighbour });
		}
	}
	return edges;
}

function nearestNeighboursOf(node: GlyphNode, nodes: GlyphNode[]): GlyphNode[] {
	return nodes
		.filter((candidate) => candidate !== node)
		.sort((first, second) => distanceBetween(node, first) - distanceBetween(node, second))
		.slice(0, NEIGHBOUR_LINKS);
}

function distanceBetween(first: GlyphNode, second: GlyphNode): number {
	return Math.hypot(first.x - second.x, first.y - second.y);
}

function hasEdge(edges: GlyphEdge[], first: GlyphNode, second: GlyphNode): boolean {
	return edges.some(
		(edge) =>
			(edge.from === first && edge.to === second) || (edge.from === second && edge.to === first)
	);
}
