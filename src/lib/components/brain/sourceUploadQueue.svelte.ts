import { resolveUpload } from './uploadResolution';
import { uploadSourceFile, type UploadOutcome } from './uploadSourceFile';

export type QueuedUploadStatus = 'waiting' | 'sending' | 'reading' | 'done' | 'failed';

export type QueuedUpload = {
	id: number;
	filename: string;
	status: QueuedUploadStatus;
	stageLabel: string;
	message: string;
};

type QueueEntry = {
	upload: QueuedUpload;
	file: File;
	brainId: string;
	settle: (outcome: UploadOutcome) => void;
};

type QueueListeners = {
	onOutOfCredits: () => void;
	onSettled: () => Promise<void>;
};

const activeStatuses: QueuedUploadStatus[] = ['waiting', 'sending', 'reading'];

/** Uploads and reads files one after another, so two readings never run at once. */
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
		return this.uploads.some((upload) => activeStatuses.includes(upload.status));
	}

	get hasFinished(): boolean {
		return this.uploads.some((upload) => !activeStatuses.includes(upload.status));
	}

	enqueue(file: File, brainId: string): Promise<UploadOutcome> {
		const upload = this.#track(file.name);
		return new Promise((settle) => {
			this.#pending.push({ upload, file, brainId, settle });
			void this.#drain();
		});
	}

	enqueueAll(files: File[], brainId: string): void {
		files.forEach((file) => void this.enqueue(file, brainId));
	}

	clearFinished = (): void => {
		this.uploads = this.uploads.filter((upload) => activeStatuses.includes(upload.status));
	};

	#track(filename: string): QueuedUpload {
		this.uploads.push({
			id: this.#nextId,
			filename,
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

	async #run({ upload, file, brainId, settle }: QueueEntry): Promise<void> {
		upload.status = 'sending';
		const outcome = await uploadSourceFile(file, brainId, (stage) => {
			upload.status = 'reading';
			upload.stageLabel = stage;
		});
		Object.assign(upload, resolveUpload(outcome));
		if (outcome.status === 'out_of_credits') this.#listeners.onOutOfCredits();
		await this.#listeners.onSettled().catch(() => undefined);
		settle(outcome);
	}
}
