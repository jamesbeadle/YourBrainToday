<script lang="ts">
	import { onMount } from 'svelte';
	import { FaceExperience } from './createFaceExperience';
	import { attachPointerHandlers } from './experiencePointerHandlers';
	import FaceConversation from './FaceConversation.svelte';

	let containerElement: HTMLDivElement;
	let canvasElement: HTMLCanvasElement;
	let experience: FaceExperience | undefined;

	onMount(() => {
		experience = new FaceExperience(canvasElement, containerElement);
		const detachPointerHandlers = attachPointerHandlers(canvasElement, experience);
		return () => {
			detachPointerHandlers();
			experience?.destroy();
		};
	});

	function beginListening() {
		experience?.setMood('listening');
		experience?.setExpression('curious');
	}

	function beginThinking() {
		experience?.setMood('thinking');
		experience?.setExpression('focused');
	}

	function performReply(reply: string, expression: Parameters<FaceExperience['setExpression']>[0]) {
		experience?.setExpression(expression);
		experience?.speak(reply);
	}

	function returnToRest() {
		if (experience === undefined || experience.isSpeaking) return;
		experience.setMood('idle');
		experience.setExpression('neutral');
	}
</script>

<div bind:this={containerElement} class="bg-daylight relative h-full w-full overflow-hidden">
	<canvas bind:this={canvasElement} class="block h-full w-full"></canvas>
	<p class="text-slate/55 absolute top-5 left-6 font-display text-xs tracking-widest uppercase">
		Tesseract · the face of your expertise brain
	</p>
	<div class="absolute inset-x-0 bottom-6 flex justify-center px-6">
		<FaceConversation
			onListening={beginListening}
			onThinking={beginThinking}
			onSpoken={performReply}
			onRested={returnToRest}
		/>
	</div>
</div>
