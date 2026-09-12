import { createServerClient } from '@supabase/ssr';
import { text } from '@sveltejs/kit';
import { isForbiddenCrossSiteForm } from '$lib/server/http/crossSiteFormSubmission';
import { PUBLIC_SUPABASE_PUBLISHABLE_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { getUserModelOverride } from '$lib/server/anthropic/getUserModelOverride';
import { reportServerError } from '$lib/server/http/reportServerError';
import { runWithModelResolver } from '$lib/server/anthropic/modelContext';
import type { Handle } from '@sveltejs/kit';

const forbidden = 403;

export const handleError = reportServerError;

export const handle: Handle = async ({ event, resolve }) => {
	if (isForbiddenCrossSiteForm(event.request, event.url)) {
		return text('Cross-site form submissions are forbidden', { status: forbidden });
	}
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const { data: userData } = await event.locals.supabase.auth.getUser();
		event.locals.resolvedUser = userData.user;
		if (userData.user === null) return { session: null, user: null };
		const { data: sessionData } = await event.locals.supabase.auth.getSession();
		return { session: sessionData.session, user: userData.user };
	};

	let overrideLookup: Promise<string | null> | null = null;
	const resolveModelOverride = () => {
		overrideLookup = overrideLookup ?? getUserModelOverride(event.locals.supabase);
		return overrideLookup;
	};

	return runWithModelResolver(resolveModelOverride, () =>
		resolve(event, {
			filterSerializedResponseHeaders: (headerName) =>
				headerName === 'content-range' || headerName === 'x-supabase-api-version'
		})
	);
};
