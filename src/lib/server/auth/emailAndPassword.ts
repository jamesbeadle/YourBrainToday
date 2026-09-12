export type EmailAndPassword = {
	emailAddress: string;
	password: string;
};

export function readEmailAndPassword(formData: FormData): EmailAndPassword {
	return {
		emailAddress: String(formData.get('email') ?? '').trim(),
		password: String(formData.get('password') ?? '')
	};
}
