export type NavigationLink = {
	href: string;
	label: string;
};

export type NavigationGroup = {
	label: string;
	links: NavigationLink[];
};

export type NavigationAccess = {
	isSignedIn: boolean;
	isAdmin: boolean;
};

export const primaryNavigationLinks: NavigationLink[] = [
	{ href: '/', label: 'Home' },
	{ href: '/knowledge-base', label: 'Knowledge Base' },
	{ href: '/chatbots', label: 'Chatbots' },
	{ href: '/market', label: 'Market' }
];

export function buildMenuGroups(access: NavigationAccess): NavigationGroup[] {
	const groups: NavigationGroup[] = [{ label: 'Explore', links: primaryNavigationLinks }];
	if (access.isAdmin) {
		groups.push({ label: 'Manage', links: adminLinks });
	}
	groups.push({ label: 'Account', links: accountLinks(access) });
	return groups;
}

const adminLinks: NavigationLink[] = [{ href: '/admin', label: 'Admin' }];

function accountLinks(access: NavigationAccess): NavigationLink[] {
	if (!access.isSignedIn) return [{ href: '/account/sign-in', label: 'Sign in' }];
	return [{ href: '/account', label: 'Account' }];
}
