import * as exec from '@actions/exec';
import * as core from '@actions/core';

/**
 *
 * @param {string} baseCmd
 * @param {string[]} argsArray=[]
 * @return {Promise<string>} Command output
 */
export async function execAndGetOutput(baseCmd, argsArray = []) {
    let commandOutput = '';
    let commandError = '';

    try {
        const options = {
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
 * @return {Promise<string>}
 */
export async function getCurrentDirectory() {
    const directory = await execAndGetOutput('pwd');
    await execAndGetOutput('echo', [`Resolved current directory: [${directory}]`])
    return directory;
}

/**
 * @return {Promise<string>}
 */
export async function getWorkingDirectory() {
    const directory = await execAndGetOutput('readlink', ['-f', `${process.env.workingDirectory || '.'}`]);
    await execAndGetOutput('echo', [`Resolved working directory: [${directory}]`])
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
    await execAndGetOutput('echo', [`Searching based on directory: [${await getWorkingDirectory()}]`])
    const allFiles = await execAndGetOutput('find', [`${targetDirectory || '.'}`, '-type', 'f', '-iname', `${pattern}`]);
    return allFiles?.split('\n').filter(file => file);
}