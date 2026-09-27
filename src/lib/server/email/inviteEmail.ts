export function inviteEmailSubject(inviterEmail: string): string {
	return `${inviterEmail} invited you to Your Brain Today`;
}

export function renderInviteEmail(
	inviterEmail: string,
	workspaceName: string,
	signInUrl: string
): string {
	return `
<div style="margin:0;padding:32px 16px;background-color:#0c0d11;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:520px;margin:0 auto;background-color:#16171d;border:1px solid #2a2c36;border-radius:16px;padding:32px;">
		<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#edeef3;">
			YBT<span style="color:#a78bff;">.</span>
		</p>
		<h1 style="margin:0 0 12px;font-size:22px;color:#edeef3;">You've been invited</h1>
		<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			<strong style="color:#edeef3;">${inviterEmail}</strong> has invited you to collaborate
			on <strong style="color:#edeef3;">${workspaceName}</strong> in Your Brain Today —
			a shared knowledge base you can browse and ask questions of like a colleague.
		</p>
		<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			Sign in with this email address and accept the invitation from your workspace.
		</p>
		<a
			href="${signInUrl}"
			style="display:inline-block;background-color:#a78bff;color:#0c0d11;text-decoration:none;
				font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;"
		>
			Accept the invitation
		</a>
		<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6c7694;">
			If the button doesn't work, open this link: <br />
			<a href="${signInUrl}" style="color:#c9d2e6;">${signInUrl}</a>
		</p>
	</div>
</div>`;
}
