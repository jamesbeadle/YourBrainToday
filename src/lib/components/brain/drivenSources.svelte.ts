import { SvelteSet } from 'svelte/reactivity';

/** The sources this tab is reading right now, so a row is not offered a Resume it is already getting. */
export const drivenSources = new SvelteSet<string>();
