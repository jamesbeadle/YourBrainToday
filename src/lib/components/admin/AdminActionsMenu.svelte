<script lang="ts">
	import AdminMenuAction from '$lib/components/admin/AdminMenuAction.svelte';
	import type { AdminUserSummary } from '$lib/server/admin/getAdminUserList';

	let { user, onAdjustCredits }: { user: AdminUserSummary; onAdjustCredits: () => void } = $props();

	let isOpen = $state(false);
	let menuElement: HTMLElement | undefined = $state();

	function close() {
		isOpen = false;
	}

	function closeOnOutsideClick(event: MouseEvent) {
		if (!isOpen) return;
		if (menuElement?.contains(event.target as Node)) return;
		close();
	}

	function openAdjustModal() {
		close();
		onAdjustCredits();
	}
</script>

<svelte:window onclick={closeOnOutsideClick} />

<div class="relative" bind:this={menuElement}>
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		aria-haspopup="menu"
		aria-expanded={isOpen}
		aria-label={`Actions for ${user.email}`}
		class="inline-flex items-center gap-1 rounded-full border border-hairline px-4 py-1.5
			font-display text-sm whitespace-nowrap text-chalk/70 transition hover:border-go
			hover:text-go"
	>
		Actions <span aria-hidden="true" class="text-xs">▾</span>
	</button>
	{#if isOpen}
		<div
			role="menu"
			class="absolute right-0 top-full z-10 mt-2 flex w-52 flex-col rounded-2xl border
				border-hairline bg-night p-2 shadow-xl"
		>
			<button
				type="button"
				onclick={openAdjustModal}
				class="w-full rounded-xl px-3 py-2 text-left font-display text-sm text-chalk/80
					transition hover:bg-hairline/40 hover:text-chalk"
			>
				Adjust credits…
			</button>
			<AdminMenuAction
				action="?/setStaff"
				fields={{ targetEmail: user.email, shouldBeStaff: user.isStaff ? 'false' : 'true' }}
				label={user.isStaff ? 'Remove staff' : 'Make staff'}
				onDone={close}
			/>
			<AdminMenuAction
				action="?/setRestriction"
				fields={{ targetEmail: user.email, shouldRestrict: user.isRestricted ? 'false' : 'true' }}
				label={user.isRestricted ? 'Unrestrict' : 'Restrict'}
				onDone={close}
			/>
			{#if !user.isAdmin}
				<AdminMenuAction
					action="?/deleteUser"
					fields={{ targetEmail: user.email }}
					label="Delete account"
					isDestructive
					confirmMessage={`Delete ${user.email} and all of their data? This cannot be undone.`}
					onDone={close}
				/>
			{/if}
		</div>
	{/if}
</div>
