import {MavenArtifact} from "./artifact/maven-artifact";
import {GradleArtifact} from "./artifact/gradle-artifact";
import {NpmArtifact} from "./artifact/npm-artifact";
import {PyPiArtifact} from "./artifact/pypi-artifact";

// https://github.com/actions/github-script
module.exports = async () => {
    const {
        projectFramework
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

    const filesToInspect = await frameworkImpl.getFilesToInspect();
    const artifactsToCopy = await frameworkImpl.getArtifactsToCopy(filesToInspect);
    await frameworkImpl.copyArtifacts(artifactsToCopy);

}

