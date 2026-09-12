export async function readResponseWithin(
	response: Response,
	maxByteCount: number
): Promise<Uint8Array | null> {
	if (response.body === null) return new Uint8Array();
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let byteCount = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) return Buffer.concat(chunks);
		byteCount += value.byteLength;
		if (byteCount > maxByteCount) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
	}
}
