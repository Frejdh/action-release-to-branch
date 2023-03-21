import * as core from '@actions/core';
import {execAndGetOutput} from "./util/cmd.js";

// https://github.com/actions/github-script
export default async function script() {
    const {
        projectFramework
    } = process.env;

    let releaseVersion = 'UNKNOWN';
    let commandOutput = undefined;
    switch (projectFramework.toLowerCase()) {
        case 'maven':
            commandOutput = await execAndGetOutput('mvn', [
                '-q',
                '-Dexec.executable="echo"',
                '-Dexec.args="${project.version}"',
                '--non-recursive',
                'exec:exec'
            ]);
            break;
        // TODO: Implement the rest
        case 'gradle':
            break;
        case 'npm':
            break;
        case 'python':
            break;
    }
    releaseVersion = commandOutput || releaseVersion;

    core.exportVariable('RELEASE_VERSION', releaseVersion)
}