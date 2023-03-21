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
        return commandOutput;
    } catch (error) {
        core.notice(`Release version could not be detected! STDOUT: ${commandOutput}. STDERR: ${commandError}`);
        core.setFailed(commandError);
    }

}

/**
 *
 * @param {string} pattern (bash 'find' syntax)
 * @param {string?} targetDirectory Optional directory to base the search on. Relative path from working directory,
 * @return {Promise<string[]>}
 */
export async function findFilesMatchingPattern(pattern, targetDirectory) {
    if (!targetDirectory) {
        targetDirectory = process?.env?.workingDirectory || '.';
    }
    await execAndGetOutput('echo', ['"Searching based on directory: [$(pwd)]"'])
    const allFiles = await execAndGetOutput('find', [`"${targetDirectory || '.'}"`, '-type', 'f', '-iname', `"${pattern}"`]);
    return allFiles?.split('\n').filter(file => file);
}