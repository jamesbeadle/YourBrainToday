import { resolveUpload } from './uploadResolution';
import { isStillActive, type QueuedUpload, type QueuedWork } from './queuedUpload';
import { uploadSourceFile, type UploadOutcome } from './uploadSourceFile';

type QueueEntry = {
	upload: QueuedUpload;
	work: QueuedWork;
	settle: (outcome: UploadOutcome) => void;
};

type QueueListeners = {
	onOutOfCredits: () => void;
	onSettled: () => Promise<void>;
};

const sendingFileLine = 'sending the file…';

/** Takes sources into the brain one after another, so two readings never run at once. */
export class SourceUploadQueue {
	#listeners: QueueListeners;
	#pending: QueueEntry[] = [];
	#isDraining = false;
	#nextId = 1;
	uploads = $state<QueuedUpload[]>([]);

	constructor(listeners: QueueListeners) {
		this.#listeners = listeners;
	}

	get isBusy(): boolean {
		return this.uploads.some(isStillActive);
	}

	get hasFinished(): boolean {
		return this.uploads.some((upload) => !isStillActive(upload));
	}

	enqueue(filename: string, sendingLine: string, work: QueuedWork): Promise<UploadOutcome> {
		const upload = this.#track(filename, sendingLine);
		return new Promise((settle) => {
			this.#pending.push({ upload, work, settle });
			void this.#drain();
		});
	}

	enqueueFile(file: File, brainId: string): Promise<UploadOutcome> {
		return this.enqueue(file.name, sendingFileLine, (onProgress) =>
			uploadSourceFile(file, brainId, onProgress)
		);
	}

	enqueueFiles(files: File[], brainId: string): void {
		files.forEach((file) => void this.enqueueFile(file, brainId));
	}

	clearFinished = (): void => {
		this.uploads = this.uploads.filter(isStillActive);
	};

	#track(filename: string, sendingLine: string): QueuedUpload {
		this.uploads.push({
			id: this.#nextId,
			filename,
			sendingLine,
			status: 'waiting',
			stageLabel: '',
			message: ''
		});
		this.#nextId += 1;
		return this.uploads[this.uploads.length - 1];
	}

	async #drain(): Promise<void> {
		if (this.#isDraining) return;
		this.#isDraining = true;
		for (let entry = this.#pending.shift(); entry !== undefined; entry = this.#pending.shift()) {
			await this.#run(entry);
		}
		this.#isDraining = false;
	}

	async #run({ upload, work, settle }: QueueEntry): Promise<void> {
		upload.status = 'sending';
		const outcome = await work((stage) => {
			upload.status = 'reading';
			upload.stageLabel = stage;
		});
		Object.assign(upload, resolveUpload(outcome));
		if (outcome.status === 'out_of_credits') this.#listeners.onOutOfCredits();
		await this.#listeners.onSettled().catch(() => undefined);
		settle(outcome);
	}
}
