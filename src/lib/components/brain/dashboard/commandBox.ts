import { tick } from 'svelte';

const maximumHeightFractionOfViewport = 0.4;

export function commandBox(textarea: HTMLTextAreaElement, _textThatTriggersRefit: string) {
	let manuallyChosenHeight = 0;

	function fitToContent(): void {
		const maximumHeight = window.innerHeight * maximumHeightFractionOfViewport;
		textarea.style.height = 'auto';
		const contentHeight = Math.min(textarea.scrollHeight, maximumHeight);
		textarea.style.height = `${Math.max(contentHeight, manuallyChosenHeight)}px`;
	}

	function rememberManualResize(): void {
		manuallyChosenHeight = textarea.offsetHeight;
	}

	textarea.focus();
	fitToContent();
	textarea.addEventListener('mouseup', rememberManualResize);

	return {
		async update() {
			await tick();
			fitToContent();
		},
		destroy() {
			textarea.removeEventListener('mouseup', rememberManualResize);
		}
	};
}
