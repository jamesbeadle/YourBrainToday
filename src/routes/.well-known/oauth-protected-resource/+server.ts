import { json } from '@sveltejs/kit';
import { protectedResourceMetadata } from '$lib/server/oauth/oauthSettings';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => json(protectedResourceMetadata(url.origin));
