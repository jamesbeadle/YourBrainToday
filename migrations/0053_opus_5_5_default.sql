-- Opus 5.5 becomes the site default, run at medium effort (the effort is set
-- per request in src/lib/data/modelTraits.ts). Opus 5 leaves the slider — 5.5
-- is its cheaper successor — so every choice that named it moves up to 5.5
-- rather than being priced as a legacy model on the top rung.

begin;

update public.site_settings
set setting_value = 'claude-opus-5-5', updated_at = now()
where setting_name = 'site_model';

update public.user_model_preferences
set model_id = 'claude-opus-5-5', updated_at = now()
where model_id = 'claude-opus-5';

update public.user_model_overrides
set model_id = 'claude-opus-5-5', updated_at = now()
where model_id = 'claude-opus-5';

update public.chatbots
set model_id = 'claude-opus-5-5'
where model_id = 'claude-opus-5';

update public.chatbot_members
set model_id = 'claude-opus-5-5'
where model_id = 'claude-opus-5';

commit;
