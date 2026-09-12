import { fail, redirect } from '@sveltejs/kit';
import { destinationAfterPasswordSet } from '$lib/server/auth/destinationAfterPasswordSet';
import { problemWithNewPassword } from '$lib/server/auth/passwordRules';
import { requireUser } from '$lib/server/auth/requireUser';
import { setAccountPassword } from '$lib/server/auth/setAccountPassword';
import type { Actions, PageServerLoad } from './$types';

const badRequestStatus = 400;

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	return { emailAddress: user.email ?? '' };
};

export const actions: Actions = {
	setPassword: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const formData = await request.formData();
		const password = String(formData.get('password') ?? '');
		const confirmation = String(formData.get('confirmation') ?? '');
		const inputProblem = problemWithNewPassword(password, confirmation);
		if (inputProblem !== null) return fail(badRequestStatus, { message: inputProblem });
		const savingProblem = await setAccountPassword(locals.supabase, password);
		if (savingProblem !== null) return fail(badRequestStatus, { message: savingProblem });
		redirect(303, await destinationAfterPasswordSet(locals.supabase, user.id));
	}
};
