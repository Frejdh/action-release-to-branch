import * as exec from '@actions/exec';
import * as core from '@actions/core';

/**
 *
 * @param {string} baseCmd
 * @param {string[]} argsArray=[]
 * @param {string} workingDirectory
 * @return {Promise<string>} Command output
 */
export async function execAndGetOutput(baseCmd, argsArray = [], workingDirectory = await getWorkingDirectory()) {
    let commandOutput = '';
    let commandError = '';

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

        await exec.exec(baseCmd, argsArray, options);
        return commandOutput.trimEnd();
    } catch (error) {
        core.notice(`Release version could not be detected! STDOUT: ${commandOutput}. STDERR: ${commandError}`);
        core.setFailed(commandError);
    }

}


/**
 * @param {any} message
 * @return {void}
 */
export async function log(message) {
    await execAndGetOutput('echo', [message?.toString()]);
}

/**
 * @return {Promise<string>}
 */
export async function getCurrentDirectory() {
    const directory = await execAndGetOutput('pwd');
    await log(`Resolved current directory: [${directory}]`);
    return directory;
}

/**
 * Reads the working directory from an environment variable if it exists. Otherwise, use the currently opened directory.
 * @return {Promise<string>}
 */
export async function getWorkingDirectory() {
    const directory = await execAndGetOutput('readlink', ['-f', `${process.env.workingDirectory || '.'}`]);
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