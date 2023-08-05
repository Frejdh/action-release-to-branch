import * as core from "@actions/core";
import { GradleArtifact } from "./artifact/gradle-artifact.js";
import { MavenArtifact } from "./artifact/maven-artifact.js";
import { NpmArtifact } from "./artifact/npm-artifact.js";
import { PyPiArtifact } from "./artifact/pypi-artifact.js";
import { getAppRepositoryDirectory, getReleaseRepositoryDirectory } from "./util/cmd.js";
import { checkoutBranch } from "./util/git.js";

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
			throw new Error('Project framework not known');
	}

	const appRepositoryDir = await getAppRepositoryDirectory();
	const releaseRepositoryDir = await getReleaseRepositoryDirectory();

	await checkoutBranch(defaultBranch, appRepositoryDir);
	const filesToInspect = await frameworkImpl.getFilesToInspect();
	const artifactsToCopy = await frameworkImpl.getArtifactsToCopy(filesToInspect);
	if (!artifactsToCopy?.length) {
		throw new Error('No artifacts found');
	}

	await checkoutBranch(releaseBranch, releaseRepositoryDir);
	await frameworkImpl.copyArtifacts(artifactsToCopy);

	core.exportVariable('RELEASE_VERSION', artifactsToCopy[0].version);
}


