import { fail } from '@sveltejs/kit';
import { adjustCredits, readCreditAdjustment } from '$lib/server/admin/adjustCredits';
import { deleteUserAccount } from '$lib/server/admin/deleteUserAccount';
import { getAdminPurchaseList } from '$lib/server/admin/getAdminPurchaseList';
import { getAdminUserList } from '$lib/server/admin/getAdminUserList';
import { getSiteModel } from '$lib/server/anthropic/getSiteModel';
import { isKnownSiteModel } from '$lib/data/siteModels';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import { setAccountRestriction } from '$lib/server/admin/setAccountRestriction';
import { setSiteModel } from '$lib/server/admin/setSiteModel';
import { setUserModel } from '$lib/server/admin/setUserModel';
import { setStaffAccess } from '$lib/server/admin/setStaffAccess';
import type { Actions, PageServerLoad } from './$types';

const signedNumber = new Intl.NumberFormat('en-GB', { signDisplay: 'always' });

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);
	return {
		users: await getAdminUserList(locals.supabase),
		purchases: await getAdminPurchaseList(),
		siteModel: await getSiteModel()
	};
};

export const actions: Actions = {
	setSiteModel: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const modelId = String(formData.get('modelId') ?? '');
		if (!isKnownSiteModel(modelId)) {
			return fail(400, { message: 'Choose one of the listed models.' });
		}
		await setSiteModel(locals.supabase, modelId);
		return { message: `The site now runs on ${modelId}.` };
	},
	setUserModel: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		const modelId = String(formData.get('modelId') ?? '');
		if (targetEmail === '') return fail(400, { message: 'A user is required.' });
		if (modelId !== '' && !isKnownSiteModel(modelId)) {
			return fail(400, { message: 'Choose one of the listed models.' });
		}
		await setUserModel(locals.supabase, targetEmail, modelId);
		return {
			message:
				modelId === ''
					? `${targetEmail} now follows the site model.`
					: `${targetEmail} now runs on ${modelId}.`
		};
	},
	adjustCredits: async ({ locals, request }) => {
		await requireAdmin(locals);
		const adjustment = readCreditAdjustment(await request.formData());
		if ('message' in adjustment) return fail(400, adjustment);
		const newBalance = await adjustCredits(locals.supabase, adjustment);
		const signedDelta = signedNumber.format(adjustment.creditDelta);
		return {
			message: `${adjustment.targetEmail} adjusted by ${signedDelta} credits — balance ${newBalance}.`
		};
	},
	setRestriction: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		const shouldRestrict = String(formData.get('shouldRestrict')) === 'true';
		if (targetEmail === '') return fail(400, { message: 'A user is required.' });
		await setAccountRestriction(locals.supabase, targetEmail, shouldRestrict);
		const restrictionState = shouldRestrict ? 'restricted' : 'unrestricted';
		return { message: `${targetEmail} is now ${restrictionState}.` };
	},
	setStaff: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		const shouldBeStaff = String(formData.get('shouldBeStaff')) === 'true';
		if (targetEmail === '') return fail(400, { message: 'A user is required.' });
		await setStaffAccess(locals.supabase, targetEmail, shouldBeStaff);
		const staffState = shouldBeStaff ? 'now staff' : 'no longer staff';
		return { message: `${targetEmail} is ${staffState}.` };
	},
	deleteUser: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		if (targetEmail === '') return fail(400, { message: 'A user is required.' });
		try {
			await deleteUserAccount(locals.supabase, targetEmail);
		} catch {
			return fail(400, {
				message: `${targetEmail} could not be deleted — admin accounts and accounts that own team data are protected.`
			});
		}
		return { message: `${targetEmail} has been deleted.` };
	}
};
