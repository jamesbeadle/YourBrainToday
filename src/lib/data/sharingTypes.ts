export type ShareScope = 'brain' | 'entity';

export type WorkspaceShare = {
	id: string;
	collaboratorEmail: string;
	scope: ShareScope;
	createdAt: string;
};

export type InviteStatus = 'pending' | 'declined';

export type WorkspaceInvite = {
	id: string;
	invitedEmail: string;
	scope: ShareScope;
	status: InviteStatus;
	createdAt: string;
};

export type ReceivedInvite = {
	id: string;
	invitedByEmail: string;
	targetName: string;
	scope: ShareScope;
};

export type SharedBrainSummary = {
	brainId: string;
	entityId: string;
	brainName: string;
	entityName: string;
	href: string;
};

export type ProposalChangeKind = 'context_write' | 'page_write' | 'page_delete' | 'context_delete';

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export type BrainChangeProposal = {
	id: string;
	proposerEmail: string;
	sourceId: string | null;
	sourceFilename: string;
	changeKind: ProposalChangeKind;
	slug: string;
	title: string;
	payload: Record<string, unknown>;
	before: Record<string, unknown> | null;
	status: ProposalStatus;
	createdAt: string;
};
