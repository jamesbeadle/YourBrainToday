// Two questions read the same when only case, spacing and the punctuation
// at the end differ — enough to count a repeat, not enough to guess at meaning.
export function comparableWording(question: string): string {
	return question.toLowerCase().replace(/\s+/g, ' ').replace(/[?.!\s]+$/, '').trim();
}

export function readTheSame(left: string, right: string): boolean {
	return comparableWording(left) === comparableWording(right);
}
