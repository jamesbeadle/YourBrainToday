import { describe, expect, it } from 'vitest';
import { isRememberRequest } from './rememberRequest';

describe('isRememberRequest', () => {
	it('recognises a message that opens by asking the brain to remember', () => {
		expect(isRememberRequest('Remember this')).toBe(true);
		expect(isRememberRequest('remember: we moved that supplier to net-60')).toBe(true);
		expect(isRememberRequest('  Please remember that invoices go to accounts first')).toBe(true);
	});

	it('leaves a question that merely mentions remembering alone', () => {
		expect(isRememberRequest('Do you remember the retention terms?')).toBe(false);
		expect(isRememberRequest('Remembering the old process, what changed?')).toBe(false);
		expect(isRememberRequest('')).toBe(false);
	});
});
