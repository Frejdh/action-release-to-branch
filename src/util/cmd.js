import * as core from '@actions/core';
import * as exec from '@actions/exec';

/**
 *
 * @param {string} baseCmd
 * @param {string[]} argsArray=[]
 * @param {boolean} useDefaultWorkingDirectory=true
 * @return {Promise<string>} Command output
 */
export async function execAndGetOutput(baseCmd, argsArray = [], useDefaultWorkingDirectory = true) {
	const commandToExecuteString = argsArray?.length ? `${baseCmd} "${argsArray.join('" "')}"` : baseCmd;
	let commandOutput = '';
	let commandError = '';

	try {
		const options = {
			cwd: useDefaultWorkingDirectory ? await getWorkingDirectory() : undefined,
			listeners: {
				stdout: (data) => {
					commandOutput += data.toString();
				},
				stderr: (data) => {
					commandError += data.toString();
				}
			}
		};

		await log(`==> ${commandToExecuteString}`);
		await exec.exec(baseCmd, argsArray, options);
		return commandOutput.trimEnd();
	} catch (error) {
		core.notice(commandError);
		throw new Error(`Command failed for [${commandToExecuteString}]!\nError name: ${error.name}\nError Message: ${error.message}\nCommand STDOUT: ${commandOutput}\nCommand STDERR: ${commandError}\nError Stacktrace: ${error.stack}`)
	}

}


/**
 * @param {any} message
 * @return {void}
 */
export async function log(message) {
	await execAndGetOutput('echo', [message?.toString()], false);
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
	const directory = await execAndGetOutput('readlink', ['-f', `${process.env.workingDirectory || '.'}`], false);
	await log(`Resolved working directory: [${directory}]`);
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
		targetDirectory = await getWorkingDirectory();
	}
	await log(`Searching based on directory: [${await getWorkingDirectory()}]`);
	const allFiles = await execAndGetOutput('find', [`${targetDirectory || '.'}`, '-type', 'f', '-iname', `${pattern}`]);
	return allFiles?.split('\n').filter(file => file);
}