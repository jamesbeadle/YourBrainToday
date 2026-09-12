export function chatbotInviteEmailSubject(inviterEmail: string, chatbotName: string): string {
	return `${inviterEmail} invited you to ask ${chatbotName}`;
}

export function renderChatbotInviteEmail(
	inviterEmail: string,
	chatbotName: string,
	chatbotUrl: string
): string {
	return `
<div style="margin:0;padding:32px 16px;background-color:#0b0e16;font-family:Arial,Helvetica,sans-serif;">
	<div style="max-width:520px;margin:0 auto;background-color:#141927;border:1px solid #242c40;border-radius:16px;padding:32px;">
		<p style="margin:0 0 24px;font-size:20px;font-weight:bold;color:#eef1f8;">
			YBT<span style="color:#ff4d5e;">.</span>
		</p>
		<h1 style="margin:0 0 12px;font-size:22px;color:#eef1f8;">Meet ${chatbotName}</h1>
		<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			<strong style="color:#eef1f8;">${inviterEmail}</strong> has given you access to
			<strong style="color:#eef1f8;">${chatbotName}</strong> — a chatbot that answers from
			their knowledge base, so you can ask it what you'd ask them.
		</p>
		<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#c9d2e6;">
			Open the link and sign in with this email address — that's
			all it takes to join.
		</p>
		<a
			href="${chatbotUrl}"
			style="display:inline-block;background-color:#ff4d5e;color:#0b0e16;text-decoration:none;
				font-size:15px;font-weight:bold;padding:12px 28px;border-radius:999px;"
		>
			Open ${chatbotName}
		</a>
		<p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6c7694;">
			If the button doesn't work, open this link: <br />
			<a href="${chatbotUrl}" style="color:#c9d2e6;">${chatbotUrl}</a>
		</p>
	</div>
</div>`;
}
