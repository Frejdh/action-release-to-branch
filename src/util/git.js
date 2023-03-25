import { execAndGetOutput, log } from "./cmd.js";

/**
 * @param {string} branch
 * @return {Promise<void>}
 */
export async function checkoutBranch(branch) {
	await log(`Checking out branch [${branch}]`);
	await execAndGetOutput('git', ['checkout', branch]);
}

/**
 *
 * @param {string} patternMatching
 * @return {Promise<void>}
 */
export async function stageFiles(patternMatching = '.') {
	await execAndGetOutput('git', ['add', patternMatching]);
}

/**
 *
 * @param {string} message
 * @return {Promise<void>}
 */
export async function createCommit(message) {
	await execAndGetOutput('git', ['commit', message]);
}

/**
 *
 * @param {string} tag Required tag name
 * @param {string?} message Optional message
 * @return {Promise<void>}
 */
export async function createTag(tag, message) {
	const gitArgs = ['tag', tag];
	if (message) {
		gitArgs.push('-m', message);
	}
	await execAndGetOutput('git', gitArgs);
}


/**
 *
 * @return {Promise<string>}
 */
export async function getCurrentBranch() {
	return await execAndGetOutput('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
}

/**
 *
 * @param {boolean} force
 * @param {string} tag
 * @return {Promise<void>}
 */
export async function pushToRemote(force = false, tag = undefined) {
	const gitArgs = ['push'];
	if (force) {
		gitArgs.push('--force');
	}

	gitArgs.push('--set-upstream', 'origin');
	gitArgs.push(tag || await getCurrentBranch());

	await execAndGetOutput('git', gitArgs);
}