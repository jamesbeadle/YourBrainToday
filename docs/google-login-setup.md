# Google login setup

The code is already complete: `/account/sign-in` renders the Google button, the
`signInWithGoogle` action calls `beginOAuthSignIn(locals.supabase, 'google', origin)`,
and `/auth/callback` exchanges the code for a session and lands on `/knowledge-base`.
Everything below is one-time configuration in the Google Cloud Console and the Supabase
dashboard for the Your Brain Today project.

## The values this project uses

| What | Value |
| --- | --- |
| Supabase project | `mvlwqqahocohlfnehegp` (eu-west-2) |
| Supabase callback URL | `https://mvlwqqahocohlfnehegp.supabase.co/auth/v1/callback` |
| Canonical domain | `https://www.yourbrain.today` — the apex 308-redirects to it |
| Vercel domain | `https://your-brain-today.vercel.app` |
| Local dev | `http://localhost:5173` |

## 1. The OAuth client in Google Cloud Console

The consent screen's app name is a property of the Google Cloud **project**, not of the
client. Reusing the Your Business Today project is quicker, but everyone signing in to
Your Brain Today will see "Your Business Today" on the Google consent screen. A separate
Google Cloud project is the only way to show the right name.

Either way, the existing accounts still match: Supabase links a Google identity by the
`sub` Google returns, which is the user's Google account id and is the same whichever
OAuth client asks. The seven accounts copied from the old project keep working.

In [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials):

1. If the consent screen is not configured in this project yet:
   - User type: **External**
   - App name: **Your Brain Today**
   - Support email and developer contact: your address
   - Scopes: leave the defaults — Supabase needs only `openid`, `email`, `profile`,
     which are non-sensitive and need no verification review
   - **Publish** the app, or only allow-listed test users can sign in
2. **Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Your Brain Today`
   - **Authorised JavaScript origins**:
     - `https://www.yourbrain.today`
     - `https://yourbrain.today`
     - `http://localhost:5173`
   - **Authorised redirect URIs** — this one only:
     - `https://mvlwqqahocohlfnehegp.supabase.co/auth/v1/callback`

     The app's own `/auth/callback` is not entered here. Supabase redirects to it after
     Google returns.
3. Copy the **Client ID** and **Client secret**.

## 2. Enable the provider in Supabase

**Authentication → Sign In / Providers → Google**:

1. Toggle **Enable Sign in with Google** on.
2. Paste the Client ID and Client secret.
3. Save.

## 3. Allow the redirect URLs in Supabase

The sign-in code sends people back to `{origin}/auth/callback?next=…`, so Supabase has to
allow those origins. In **Authentication → URL Configuration**:

- **Site URL**: `https://www.yourbrain.today`
- **Redirect URLs**:
  - `https://www.yourbrain.today/**`
  - `https://yourbrain.today/**`
  - `https://your-brain-today.vercel.app/**`
  - `http://localhost:5173/**`

Without these, an OAuth sign-in is bounced to the Site URL and the `next` destination is
dropped.

## 4. Test

1. Open `https://www.yourbrain.today/account/sign-in` and click **Continue with Google**.
2. You should get Google's account chooser, then land on `/knowledge-base` signed in.
3. Check **Authentication → Users**: the account should be the existing row, not a new
   one — the copied identity matched.

## Troubleshooting

- **`redirect_uri_mismatch` from Google** — the redirect URI on the Google client does not
  exactly match the Supabase callback URL. Check for a trailing slash.
- **`access_denied` / "app not verified"** — the consent screen is still in Testing mode.
  Publish it, or add the address as a test user.
- **Signed in but bounced to the front page** — the origin is missing from the Supabase
  redirect URL list.
- **A second user row appears for someone who already had an account** — the identity did
  not match. Check `auth.identities` for two rows with the same email and different
  `provider_id`.
