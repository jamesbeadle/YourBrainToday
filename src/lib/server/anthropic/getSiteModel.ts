import { env } from '$env/dynamic/private';
import { defaultSiteModel } from '$lib/data/siteModels';
import { siteModelSettingName } from './anthropicConstants';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export async function getSiteModel(): Promise<string> {
	if (!env.SUPABASE_SECRET_KEY) return defaultSiteModel;
	const { data, error } = await supabaseServiceClient()
		.from('site_settings')
		.select('setting_value')
		.eq('setting_name', siteModelSettingName)
		.maybeSingle();
	if (error) throw error;
	return data?.setting_value ?? defaultSiteModel;
}
