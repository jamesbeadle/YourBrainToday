import { existsSync, readFileSync } from 'node:fs';

// KEY=value lines, # comments, optional single or double quotes. Values
// already in the environment win, as they do for the app itself.
export function loadDotEnv(filePath) {
	if (!existsSync(filePath)) return;
	for (const line of readFileSync(filePath, 'utf8').split('\n')) {
		const assignment = line.trim();
		if (assignment === '' || assignment.startsWith('#')) continue;
		const separatorIndex = assignment.indexOf('=');
		if (separatorIndex < 0) continue;
		const key = assignment.slice(0, separatorIndex).trim();
		if (process.env[key] !== undefined) continue;
		process.env[key] = unquote(assignment.slice(separatorIndex + 1).trim());
	}
}

function unquote(value) {
	const isQuoted =
		value.length >= 2 &&
		((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")));
	return isQuoted ? value.slice(1, -1) : value;
}
