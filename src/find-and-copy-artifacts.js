import {MavenArtifact} from "./artifact/maven-artifact.js";
import {GradleArtifact} from "./artifact/gradle-artifact.js";
import {NpmArtifact} from "./artifact/npm-artifact.js";
import {PyPiArtifact} from "./artifact/pypi-artifact.js";

// https://github.com/actions/github-script
export default async function script() {
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


