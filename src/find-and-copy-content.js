import * as core from "@actions/core";
import { GradleArtifact } from "./artifact/gradle-artifact.js";
import { MavenArtifact } from "./artifact/maven-artifact.js";
import { NodeArtifact } from "./artifact/node-artifact.js";
import { NpmArtifact } from "./artifact/npm-artifact.js";
import { PyPiArtifact } from "./artifact/pypi-artifact.js";
import { getAppRepositoryDirectory, getReleaseRepositoryDirectory } from "./util/cmd.js";
import { getEnv } from "./util/env.js";
import { checkoutBranch } from "./util/git.js";

// https://github.com/actions/github-script
export default async function script() {
	/**
	 * @type CopyContentEnv
	 */
	const {
		projectFramework,
		projectCommitish,
		releaseBranch
	} = process.env;

	/**
	 * @type {AbstractArtifact | undefined}
	 */
	let frameworkImpl = getFramework(projectFramework);

	const appRepositoryDir = await getAppRepositoryDirectory();
	const releaseRepositoryDir = await getReleaseRepositoryDirectory();

	await checkoutBranch(projectCommitish, appRepositoryDir);
	const filesToInspect = await frameworkImpl.getFilesToInspect();
	const filesOrArtifactsToCopy = await frameworkImpl.getContentToCopy(filesToInspect);
	if (!filesOrArtifactsToCopy?.length) {
		throw new Error('No artifacts or files found');
	}

	await checkoutBranch(releaseBranch, releaseRepositoryDir);
	await frameworkImpl.preprocessBeforeCopy();
	await frameworkImpl.copyContent(filesOrArtifactsToCopy);

	const appInfo = await frameworkImpl.getAppInfo(filesToInspect);
	core.exportVariable('RELEASE_NAME', appInfo.name);
	core.exportVariable('RELEASE_VERSION', appInfo.version);
}

/**
 * @param {string} projectFramework
 * @return {AbstractArtifact | undefined}
 */
export function getFramework(projectFramework = getEnv().projectFramework) {
	switch (projectFramework?.toLowerCase()) {
		case 'maven':
			return new MavenArtifact();
		case 'node':
			return new NodeArtifact();
	  	// TODO: Implement the rest
		case 'gradle':
			return new GradleArtifact();
		case 'npm':
			return new NpmArtifact();
		case 'python':
			return new PyPiArtifact();
		default:
			throw new Error('Project framework not known');
	}
}
