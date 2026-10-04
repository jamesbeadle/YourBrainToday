export type LinkTarget =
	| { kind: 'githubRepository'; owner: string; name: string; branch: string | null; folder: string }
	| { kind: 'githubFile'; owner: string; name: string; branch: string; path: string }
	| { kind: 'xPost'; handle: string; postId: string }
	| { kind: 'xProfile'; handle: string }
	| { kind: 'webPage' };

const githubHosts = ['github.com', 'www.github.com'];
const xHosts = ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com', 'mobile.twitter.com'];
const xReservedPaths = ['home', 'explore', 'search', 'i', 'settings', 'notifications', 'messages'];

/** What a link points at, so the right reader can take it in. */
export function recogniseLink(link: URL): LinkTarget {
	const segments = link.pathname.split('/').filter((segment) => segment !== '');
	if (githubHosts.includes(link.hostname)) return recogniseGithubLink(segments);
	if (xHosts.includes(link.hostname)) return recogniseXLink(segments);
	return { kind: 'webPage' };
}

function recogniseGithubLink(segments: string[]): LinkTarget {
	const [owner, repository, view, branch, ...rest] = segments;
	if (owner === undefined || repository === undefined) return { kind: 'webPage' };
	const name = repository.replace(/\.git$/, '');
	if (view === undefined) return { kind: 'githubRepository', owner, name, branch: null, folder: '' };
	if (view === 'tree' && branch !== undefined) {
		return { kind: 'githubRepository', owner, name, branch, folder: rest.join('/') };
	}
	if (view === 'blob' && branch !== undefined && rest.length > 0) {
		return { kind: 'githubFile', owner, name, branch, path: rest.join('/') };
	}
	return { kind: 'webPage' };
}

function recogniseXLink(segments: string[]): LinkTarget {
	const [handle, view, postId] = segments;
	if (handle === undefined || xReservedPaths.includes(handle)) return { kind: 'webPage' };
	if (view === 'status' && postId !== undefined) {
		return { kind: 'xPost', handle, postId: postId.replace(/\D.*$/, '') };
	}
	if (view === undefined) return { kind: 'xProfile', handle };
	return { kind: 'webPage' };
}
