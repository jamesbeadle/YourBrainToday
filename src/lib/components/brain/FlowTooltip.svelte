<script lang="ts">
	import type { FlowEdge, FlowHover, FlowNode } from './flow/flowTypes';

	let {
		hover,
		node = undefined,
		edge = undefined,
		roleNameFor
	}: {
		hover: FlowHover;
		node?: FlowNode;
		edge?: FlowEdge;
		roleNameFor: (nodeId: string) => string;
	} = $props();

	const title = $derived(node?.name ?? edge?.artefact ?? '');
	const caption = $derived(captionFor());
	const detail = $derived(detailFor());

	function captionFor(): string {
		if (edge !== undefined) return `${roleNameFor(edge.fromId)} → ${roleNameFor(edge.toId)}`;
		if (node === undefined) return '';
		if (node.kind === 'source') return 'External input · the outside world';
		if (node.kind === 'sink') return `Business output · ${node.roleName}`;
		return node.isInferred ? `${node.roleName} · assumed, not yet confirmed` : node.roleName;
	}

	function detailFor(): string {
		if (edge !== undefined) return edge.failureNote === '' ? 'No failure note yet' : edge.failureNote;
		if (node === undefined || node.kind !== 'station') return node?.summary ?? '';
		const inputs = node.inputs.length === 0 ? '—' : node.inputs.join(', ');
		const outputs = node.outputs.length === 0 ? '—' : node.outputs.join(', ');
		return `${inputs} → ${outputs}`;
	}
</script>

<div
	class="pointer-events-none absolute z-10 max-w-72 -translate-y-full rounded-lg border
		border-hairline bg-night/85 px-3 py-2 backdrop-blur"
	style={`left: ${hover.x + 14}px; top: ${hover.y - 10}px`}
>
	<p class="font-display text-sm text-chalk">{title}</p>
	<p class="text-xs text-chalk/50">{caption}</p>
	{#if detail !== ''}
		<p class="mt-1 text-xs text-chalk/70">{detail}</p>
	{/if}
</div>
