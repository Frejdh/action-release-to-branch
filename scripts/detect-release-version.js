// https://github.com/actions/github-script

module.exports = async ({core, execa}) => {
    const {
        projectFramework
    } = process.env;

    let commandOutput = '';
    let commandError = '';
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

    let releaseVersion = 'UNKNOWN';
    try {
        switch (projectFramework.toLowerCase()) {
            case 'maven':
                await exec.exec('mvn', [
                    '-q',
                    '-Dexec.executable="echo"',
                    '-Dexec.args="${project.version}"',
                    '--non-recursive',
                    'exec:exec'
                ], options);
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
    } catch (error) {
        core.notice(`Release version could not be detected! STDOUT: ${commandOutput}. STDERR: ${commandError}`);
    }

    core.exportVariable('RELEASE_VERSION', releaseVersion)
}