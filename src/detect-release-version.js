import * as core from '@actions/core';
import { findPackageJSON } from "node:module";
import { execAndGetOutput, findFilesMatchingPattern, getAppRepositoryDirectory } from "./util/cmd.js";

// https://github.com/actions/github-script
export default async function script() {
	const {
		projectFramework,
		appDirectory
	} = process.env;

	/**
	 * @type {string | undefined}
	 */
	let releaseVersion = 'UNKNOWN';
	let commandOutput = '';

	switch (projectFramework.toLowerCase()) {
		case 'maven':
			commandOutput = await execAndGetOutput('mvn', [
				'-q',
				'-Dexec.executable="echo"',
				'-Dexec.args=${project.version}',
				'--non-recursive',
				'exec:exec'
			], appDirectory);
			break;
	  	// TODO: Implement the rest
		case 'gradle':
			break;
		case 'npm':
		case 'node': {
			const files = await findFilesMatchingPattern('*package.json', appDirectory);
			commandOutput = files.filter(file => require(`${appDirectory}/${file}`)?.version).find(Boolean);
			break;
		}
		case 'python':
			break;
	}
	releaseVersion = (commandOutput || releaseVersion)?.trim();

	core.exportVariable('RELEASE_VERSION', releaseVersion)
}