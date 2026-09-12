# Google login setup

The code path is already complete: `/account/sign-in` renders the Google button, the
`signInWithGoogle` action calls `beginOAuthSignIn(locals.supabase, 'google', origin)`,
and `/auth/callback` exchanges the code for a session. Everything below is one-time
configuration in the Google Cloud Console and the Supabase dashboard.

## 1. Find your Supabase callback URL

1. Open the [Supabase dashboard](https://supabase.com/dashboard) and select the portal project.
2. Go to **Authentication → Sign In / Providers → Google**.
3. Copy the **Callback URL** shown there. It looks like:

   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```

   (The `<project-ref>` is the same subdomain as your `PUBLIC_SUPABASE_URL`.)

Keep this tab open — you'll come back in step 3.

## 2. Create the OAuth client in Google Cloud Console

In your existing Google Cloud project:

1. Open [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. If the consent screen isn't configured yet you'll be prompted first
   (**OAuth consent screen** / "Google Auth Platform → Branding"):
   - User type: **External**
   - App name: **YourBusinessToday** (or your preferred public name)
   - Support email + developer contact: your address
   - Scopes: leave the defaults — Supabase only needs `openid`, `email`, `profile`
     (non-sensitive, no verification review required)
   - When done, **Publish** the app (move it from Testing to In production),
     otherwise only allow-listed test users can sign in.
3. **Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `YourBusinessToday portal`
   - **Authorised JavaScript origins**:
     - `https://yourbusiness.today` (adjust to your production domain)
     - `http://localhost:5173`
   - **Authorised redirect URIs**: paste the Supabase callback URL from step 1
     — this is the only redirect URI Google needs; your app's `/auth/callback`
     is *not* entered here (Supabase redirects to it afterwards).
4. Save, then copy the **Client ID** and **Client secret**.

## 3. Enable the provider in Supabase

Back in **Authentication → Sign In / Providers → Google**:

1. Toggle **Enable Sign in with Google** on.
2. Paste the **Client ID** and **Client secret** from step 2.
3. Save.

## 4. Allow your app's redirect URLs in Supabase

The sign-in code sends users back to `{origin}/auth/callback?next=/workspace`, so
Supabase must allow those origins. In **Authentication → URL Configuration**:

- **Site URL**: `https://yourbusiness.today` (production domain)
- **Additional Redirect URLs**:
  - `http://localhost:5173/**`
  - `https://yourbusiness.today/**`

Without these, OAuth sign-ins get bounced to the Site URL and the `next`
destination is ignored.

## 5. Test

1. `npm run dev`, open `http://localhost:5173/account/sign-in`.
2. Click **Continue with Google** — you should see Google's account chooser with
   the app name from the consent screen, then land on `/workspace` signed in.
3. Check **Supabase → Authentication → Users**: the Google account should appear
   with provider `google`.

## Troubleshooting

- **`redirect_uri_mismatch` from Google** — the redirect URI in the Google client
  doesn't exactly match the Supabase callback URL (check for a trailing slash).
- **`access_denied` / "app not verified"** — consent screen still in Testing mode
  and the account isn't a test user; publish the app or add the account under
  Audience → Test users.
- **Lands on the wrong page after sign-in** — the origin isn't in Supabase's
  redirect URL allow-list (step 4).
- **Signed in but no admin/staff access** — the profile row is created on first
  sign-in; role flags (`is_admin` / `is_staff`) are applied after that, per
  `docs/project-management-setup.md`.
