import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RESOURCES_DIRECTORY = fileURLToPath(new URL('resources', import.meta.url));

/**
 * Resolves an absolute path inside the test resources directory, with forward slashes like the scripts build paths.
 */
export function getTestResource(...pathSegments: readonly string[]): string {
	return resolve(RESOURCES_DIRECTORY, ...pathSegments).replaceAll('\\', '/');
}
