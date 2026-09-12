<script lang="ts">
	import TaskFlowList from './TaskFlowList.svelte';
	import type { StationSelection } from './stationSelection';

	let { selection }: { selection: StationSelection | null } = $props();
</script>

{#if selection === null}
	<aside
		class="flex items-center justify-center rounded-2xl border-2 border-dashed border-hairline
			p-8 text-center text-chalk/60"
	>
		<p>
			Select any station to see the task behind it — what it needs to start, what it hands on, and
			where it crosses another role.
		</p>
	</aside>
{:else}
	<aside class="flex flex-col gap-4 rounded-2xl border border-hairline bg-carriage p-6">
		<div class="h-2.5 rounded-full" style={`background-color: ${selection.line.colour}`}></div>
		<div>
			<p class="font-display text-xs tracking-widest text-chalk/50 uppercase">
				{selection.line.role} line
			</p>
			<h2 class="font-display text-2xl font-medium">{selection.station.name}</h2>
		</div>
		{#if selection.station.producesOutput}
			<p
				class="self-start rounded-full border-2 border-tube-circle px-3 py-1 font-display text-xs
					tracking-wide"
			>
				Business output — {selection.station.producesOutput}
			</p>
		{/if}
		<p class="text-chalk/80">{selection.station.task.summary}</p>
		<TaskFlowList title="Inputs" items={selection.station.task.inputs} />
		<TaskFlowList title="Outputs" items={selection.station.task.outputs} />
		{#if selection.station.isInterchange}
			<div class="flex flex-col gap-2 border-t border-hairline pt-3 text-sm text-chalk/60">
				<p>
					Interchange — this stop connects with the
					{selection.station.connectingRoles.join(' and ')} line.
				</p>
				{#each selection.station.task.handovers ?? [] as handover (handover.toRole)}
					{#if handover.failureNote}
						<p class="text-caution/90">
							Handover to {handover.toRole} — {handover.failureNote}
						</p>
					{/if}
				{/each}
			</div>
		{/if}
	</aside>
{/if}
