# Auth Setup Guide

Sign-in is Google, or an email address and a password. The `/account/sign-in` page
renders both: the `signInWithGoogle` action redirects to Google via `beginGoogleSignIn`,
while `signInWithPassword`, `createAccount` and `sendPasswordReset` talk to Supabase's
email provider directly. `/auth/callback` exchanges the code for a session and forwards
to the `next` path when it is a local one, and to `/knowledge-base` otherwise.

Creating an account sends Supabase's verification email. A forgotten password sends a
reset link that returns through `/auth/callback` to `/account/set-password`, where the
person chooses a password and lands on `/portal` if their account is linked to a client
contact, and on `/knowledge-base` if it is not. The same page serves an invited contact
opening the link staff sent them. Passwords are at least `minimumPasswordLength`
characters — see `src/lib/server/auth/passwordRules.ts`.

The one-time Google configuration — Cloud Console client, Supabase provider toggle,
and the redirect URL allow-list — is documented in `docs/google-login-setup.md`.

The emails Supabase sends for those flows — and the app's own invite emails — come from
the built-in mailer until custom SMTP is set up. `docs/email-setup.md` covers Resend,
the SMTP relay, rebranding the templates, leaked password protection, and why a
`supabase.co` address flashes past during Google sign-in.

In the Supabase dashboard (**Authentication → Sign In / Providers**) keep Email enabled
with email confirmation on, and every other provider disabled, so the auth API refuses
sign-ups the UI does not offer.

`handle_new_user` creates the profile for every signup. Accounts start with zero
credits — the first credits come from a purchase at `/account/credits` or an admin
grant at `/admin`.
