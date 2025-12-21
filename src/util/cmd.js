import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { readFileSync } from "node:fs";
import { getEnv } from "./env.js";

/**
 * @type {string | undefined}
 */
let PACKAGE_JSON_FILE_PATH_CACHE;

/**
 * @type {string | undefined}
 */
let WORKING_DIR_CACHE;

/**
 * @type {string | undefined}
 */
let APP_DIR_CACHE;

/**
 * @type {string | undefined}
 */
let RELEASE_DIR_CACHE;

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
 * @param {...any} message
 * @return {Promise<void>}
 */
export async function log(...message) {
	await execAndGetOutput(`echo "${message?.join(' ')?.replaceAll('"', '\\"')}"`, [], null, false);
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
export async function getWorkingDirectory(preferCache = true) {
	if (!preferCache && !WORKING_DIR_CACHE) {
		const directory = await execAndGetOutput('readlink', ['-f', `${getEnv().workingDirectory || '.'}`], null);
		await log(`Resolved working directory: [${directory}]`);
		WORKING_DIR_CACHE = directory;
	}
	return WORKING_DIR_CACHE;
}

/**
 * Reads the working directory from an environment variable if it exists. Otherwise, uses the currently opened directory.
 * @return {Promise<string>}
 */
export async function getAppRepositoryDirectory(preferCache = true) {
	if (!preferCache && !APP_DIR_CACHE) {
		const directory = await execAndGetOutput('readlink', ['-f', `${getEnv().appDirectory || '.'}`], null);
		APP_DIR_CACHE = directory;
		await log(`Resolved application repository directory: [${directory}]`);
	}
	return APP_DIR_CACHE;
}

/**
 * Reads the working directory from an environment variable if it exists. Otherwise, uses the currently opened directory.
 * @return {Promise<string>}
 */
export async function getReleaseRepositoryDirectory(preferCache = true) {
	if (!preferCache && !RELEASE_DIR_CACHE) {
		const directory = await execAndGetOutput('readlink', ['-f', `${getEnv().releaseDirectory || '.'}`], null);
		RELEASE_DIR_CACHE = directory;
		await log(`Resolved node build directory: [${directory}]`);
	}
	return RELEASE_DIR_CACHE;
}

/**
 * @param {FindFilesOptions | string | string[]} optionsOrPattern bash `find -iname` syntax
 * @param {string?} cwd Optional directory to base the search on. Relative path from working directory. Only used when providing string arguments for the first parameter.
 * @return {Promise<string[]>}
 */
export async function findFilesMatchingPattern(optionsOrPattern, cwd) {
	/**
	 * @type {FindFilesOptions}
	 */
	const options = (typeof optionsOrPattern === "string" || Array.isArray(optionsOrPattern))
	  ? {
		  include: optionsOrPattern,
		  cwd
	  }
	  : optionsOrPattern;

	if (!options.cwd) {
		options.cwd = await getAppRepositoryDirectory();
	}
	await log(`Searching based on directory: [${options.cwd}]`);
	const args = [
		`${options.cwd || '.'}`,
		'-depth', '-maxdepth', options.maxDepth ?? '3',
		'-type', 'f'
	];

	// Include pattern
	(Array.isArray(options.include) ? options.include : [options.include]).filter(Boolean).forEach(filePattern => {
		args.push('-iname', `${filePattern}`);
	});

	// Exclude pattern
	(Array.isArray(options.exclude) ? options.exclude : [options.exclude]).filter(Boolean).forEach(filePattern => {
		args.push('-not', '-path', `${filePattern}`);
	});

	const allFiles = await execAndGetOutput('find', args);
	return allFiles?.split('\n').filter(Boolean);
}

/**
 * Read a file as text.
 * @param {string} file the file to read.
 * @return {string} a string or null.
 */
export async function readFileAsText(file) {
	try {
		return readFileSync(file, { encoding: 'utf8', flag: 'r' })?.toString();
	} catch (e) {
		await log(`Failed to read file as text [${file}]. Exception:`, e);
		return null;
	}
}

/**
 * Read a file as text.
 * @param {string} file the file to read.
 * @return {any | any[]} a JSON object or null.
 */
export async function readFileAsJson(file) {
	try {
		const text = readFileAsText(file);
		return JSON.parse(text);
	} catch (e) {
		await log(`Failed to read file as JSON [${file}]. Exception:`, e);
		return null;
	}
}

/**
 * Resolve the package.json file for a node project.
 * @return {PackageJson} a JSON object or null.
 */
export async function readPackageJson() {
	try {
		if (!PACKAGE_JSON_FILE_PATH_CACHE) {
			const appDir = await getAppRepositoryDirectory();
			const files = await findFilesMatchingPattern({
				include: '*package.json',
				exclude: '*/node_modules/*',
				cwd: appDir,
				maxDepth: 3
			});
			PACKAGE_JSON_FILE_PATH_CACHE = files[0] ? `${appDir}/${files[0]}` : undefined;
		}

		if (PACKAGE_JSON_FILE_PATH_CACHE) {
			return readFileAsJson(PACKAGE_JSON_FILE_PATH_CACHE);
		}
	} catch (e) {
		await log(`Failed to read package.json file. Resolved file path [${PACKAGE_JSON_FILE_PATH_CACHE}]. Exception:`, e);
	}

	return null;
}
