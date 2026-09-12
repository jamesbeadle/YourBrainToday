import { json } from '@sveltejs/kit';
import { authorizationServerMetadata } from '$lib/server/oauth/oauthSettings';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => json(authorizationServerMetadata(url.origin));
