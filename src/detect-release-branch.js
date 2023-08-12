import * as core from '@actions/core';
import { log } from "./util/cmd.js";

// https://github.com/actions/github-script

export default async function script() {
	const {
		projectFramework,
		mavenBranch,
		gradleBranch,
		npmBranch,
		pypiBranch
	} = process.env;

	let releaseBranch = 'releases';
	switch (projectFramework.toLowerCase()) {
		case 'maven':
			releaseBranch = mavenBranch || 'maven';
			break;
		case 'gradle':
			releaseBranch = gradleBranch || 'maven';
			break;
		case 'npm':
			releaseBranch = npmBranch || 'npm'
			break;
		case 'python':
			releaseBranch = pypiBranch || 'pypi'
			break;
	}

	const envVariable = 'RELEASE_BRANCH';
	await log(`Setting environment variable ${envVariable}=${releaseBranch}`)
	core.exportVariable('RELEASE_BRANCH', releaseBranch)
}