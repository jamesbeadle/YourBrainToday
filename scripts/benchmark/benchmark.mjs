import path from 'node:path';
import { createJiti } from 'jiti';
import { fileURLToPath } from 'node:url';
import { loadDotEnv } from './loadDotEnv.mjs';

// Runs the benchmark against the app's own server code without SvelteKit:
// every SvelteKit alias the readers import is pointed at a plain file.
const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '../..');

loadDotEnv(path.join(projectRoot, '.env'));

const jiti = createJiti(import.meta.url, {
	alias: {
		$lib: path.join(projectRoot, 'src/lib'),
		'$env/dynamic/private': path.join(here, 'shims/envPrivate.ts'),
		'$env/static/public': path.join(here, 'shims/envPublic.ts'),
		'$app/environment': path.join(here, 'shims/appEnvironment.ts')
	}
});

const { runBenchmark } = await jiti.import('./run.ts');
await runBenchmark(process.argv.slice(2));
