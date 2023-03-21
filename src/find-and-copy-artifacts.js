import {MavenArtifact} from "./artifact/maven-artifact.js";
import {GradleArtifact} from "./artifact/gradle-artifact.js";
import {NpmArtifact} from "./artifact/npm-artifact.js";
import {PyPiArtifact} from "./artifact/pypi-artifact.js";
import * as core from "@actions/core";
import {execAndGetOutput} from "./util/cmd";

// https://github.com/actions/github-script
export default async function script() {
    const {
        projectFramework,
        defaultBranch,
        releaseBranch
    } = process.env;

    let frameworkImpl = undefined;
    switch (projectFramework.toLowerCase()) {
        case 'maven':
            frameworkImpl = new MavenArtifact();
            break;
        // TODO: Implement the rest
        case 'gradle':
            frameworkImpl = new GradleArtifact();
            break;
        case 'npm':
            frameworkImpl = new NpmArtifact();
            break;
        case 'python':
            frameworkImpl = new PyPiArtifact();
            break;
        default:
            throw new Error('Project framework not known')
    }

    await execAndGetOutput('git', ['checkout', defaultBranch]);
    const filesToInspect = await frameworkImpl.getFilesToInspect();
    const artifactsToCopy = await frameworkImpl.getArtifactsToCopy(filesToInspect);
    if (!artifactsToCopy?.length) {
        throw new Error('No artifacts found');
    }

    await execAndGetOutput('git', ['checkout', releaseBranch]);
    await frameworkImpl.copyArtifacts(artifactsToCopy);

    core.exportVariable('RELEASE_VERSION', artifactsToCopy[0].version);
}


