import * as core from '@actions/core';
import * as exec from '@actions/exec';

/**
 *
 * @param {string} baseCmd
 * @param {string[]} argsArray=[]
 * @param {string|null?} workingDirectory Which directory the command shall be based from. Missing/undefined => Default working directory. Null => Current directory.
 * @param {boolean} logCommand=true
 * @return {Promise<string>} Command output
 */
export async function execAndGetOutput(baseCmd, argsArray = [], workingDirectory = undefined, logCommand = true) {
	const commandToExecuteString = (argsArray?.length ? `${baseCmd} "${argsArray.join('" "')}"` : baseCmd);
	let commandOutput = '';
	let commandError = '';

	if (workingDirectory === undefined) {
		workingDirectory = await getWorkingDirectory();
	}

	try {
		const options = {
			cwd: workingDirectory,
			listeners: {
				stdout: (data) => {
					commandOutput += data.toString();
				},
				stderr: (data) => {
					commandError += data.toString();
				}
			}
		};

		if (logCommand) {
			await log(`[${workingDirectory || '.'}] ==> ${commandToExecuteString}`);
		}
		await exec.exec(baseCmd, argsArray, options);
		return commandOutput.trimEnd();
	} catch (error) {
		core.notice(commandError);
		throw new Error(`Command failed for [${commandToExecuteString}]!\nError name: ${error.name}\nError Message: ${error.message}\nCommand STDOUT: ${commandOutput}\nCommand STDERR: ${commandError}\nError Stacktrace: ${error.stack}`);
	}

}


/**
 * Log a message in the console.
 * @param {any} message
 * @return {Promise<void>}
 */
export async function log(message) {
	await execAndGetOutput(`echo "${message?.toString().replaceAll('"', '\\"')}"`, [], null, false);
}

/**
 * @return {Promise<string>}
 */
export async function getCurrentDirectory() {
	const directory = await execAndGetOutput('pwd', [], false);
	await log(`Resolved current directory: [${directory}]`);
	return directory;
}

/**
 * Reads the working directory from an environment variable if it exists. Otherwise, uses the currently opened directory.
 * @return {Promise<string>}
 */
export async function getWorkingDirectory() {
	const directory = await execAndGetOutput('readlink', ['-f', `${process.env.workingDirectory || '.'}`], null);
	await log(`Resolved working directory: [${directory}]`);
	return directory;
}

/**
 * Reads the working directory from an environment variable if it exists. Otherwise, uses the currently opened directory.
 * @return {Promise<string>}
 */
export async function getAppRepositoryDirectory() {
	const directory = await execAndGetOutput('readlink', ['-f', `${process.env.appDirectory || '.'}`], null);
	await log(`Resolved application repository directory: [${directory}]`);
	return directory;
}

/**
 * Reads the working directory from an environment variable if it exists. Otherwise, uses the currently opened directory.
 * @return {Promise<string>}
 */
export async function getReleaseRepositoryDirectory() {
	const directory = await execAndGetOutput('readlink', ['-f', `${process.env.releaseDirectory || '.'}`], null);
	await log(`Resolved release repository directory: [${directory}]`);
	return directory;
}

/**
 *
 * @param {string} pattern bash 'find' -iname syntax
 * @param {string?} targetDirectory Optional directory to base the search on. Relative path from working directory,
 * @return {Promise<string[]>}
 */
export async function findFilesMatchingPattern(pattern, targetDirectory) {
	if (!targetDirectory) {
		targetDirectory = await getAppRepositoryDirectory();
	}
	await log(`Searching based on directory: [${targetDirectory}]`);
	const allFiles = await execAndGetOutput('find', [`${targetDirectory || '.'}`, '-type', 'f', '-iname', `${pattern}`]);
	return allFiles?.split('\n').filter(file => file);
}