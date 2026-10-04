import type { UploadOutcome, UploadProgress } from './uploadSourceFile';

export type QueuedUploadStatus = 'waiting' | 'sending' | 'reading' | 'done' | 'failed';

export type QueuedUpload = {
	id: number;
	filename: string;
	sendingLine: string;
	status: QueuedUploadStatus;
	stageLabel: string;
	message: string;
};

/** One source on its way into the brain: whatever gets it there, told the stage it has reached. */
export type QueuedWork = (onProgress: UploadProgress) => Promise<UploadOutcome>;

const activeStatuses: QueuedUploadStatus[] = ['waiting', 'sending', 'reading'];

export function isStillActive(upload: QueuedUpload): boolean {
	return activeStatuses.includes(upload.status);
}
