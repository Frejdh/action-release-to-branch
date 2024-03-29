import { execAndGetOutput, log } from "./cmd.js";

/**
 * @param {string} branch
 * @param {string?} workingDirectory
 * @return {Promise<void>}
 */
export async function checkoutBranch(branch, workingDirectory) {
	await log(`Checking out branch [${branch}]`);
	await execAndGetOutput('git', ['checkout', branch], workingDirectory);
}

/**
 *
 * @param {string} patternMatching
 * @param {string?} workingDirectory
 * @return {Promise<void>}
 */
export async function stageFiles(patternMatching = '.', workingDirectory) {
	await execAndGetOutput('git', ['add', patternMatching], workingDirectory);
}

/**
 *
 * @param {string} message
 * @param {string?} workingDirectory
 * @return {Promise<void>}
 */
export async function createCommit(message, workingDirectory) {
	await execAndGetOutput('git', ['commit', message], workingDirectory);
}

/**
 * Create a new tag with force. If a tag shall not be overridden, use {@link isTagOnRemote} before this call.
 * @param {string} tag Required tag name
 * @param {string?} message Optional message
 * @param {string?} workingDirectory
 * @return {Promise<void>}
 */
export async function createTag(tag, message, workingDirectory) {
	const gitArgs = ['tag', tag, '-f'];
	if (message) {
		gitArgs.push('-m', message);
	}
	await execAndGetOutput('git', gitArgs, workingDirectory);
}

/**
 * Check if a tag exists on remote
 * @param {string} tag Required tag name
 * @param {string?} workingDirectory
 * @return {Promise<boolean>}
 */
export async function isTagOnRemote(tag, workingDirectory) {
	return !!await execAndGetOutput('git', ['tag', '-l', tag], workingDirectory);
}


/**
 * @param {string?} workingDirectory
 * @return {Promise<string>}
 */
export async function getCurrentBranch(workingDirectory) {
	return await execAndGetOutput('git', ['rev-parse', '--abbrev-ref', 'HEAD'], workingDirectory);
}

/**
 *
 * @param {boolean} force
 * @param {string} tag
 * @param {string?} workingDirectory
 * @return {Promise<void>}
 */
export async function pushToRemote(force = false, tag = undefined, workingDirectory) {
	const gitArgs = ['push'];
	if (force) {
		gitArgs.push('--force');
	}

	gitArgs.push('--set-upstream', 'origin');
	gitArgs.push(tag || await getCurrentBranch());

	await execAndGetOutput('git', gitArgs, workingDirectory);
}