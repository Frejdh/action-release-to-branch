import * as core from '@actions/core';
import { getFramework } from "./find-and-copy-content.js";

// https://github.com/actions/github-script
export default async function script() {
	const {
		projectFramework,
	} = process.env;

	/**
	 * @type {AbstractArtifact | undefined}
	 */
	let frameworkImpl = getFramework(projectFramework);
	const filesToInspect = await frameworkImpl.getFilesToInspect();

	const appInfo = await frameworkImpl.getAppInfo(filesToInspect);
	core.exportVariable('RELEASE_NAME', appInfo.name || 'UNKNOWN');
	core.exportVariable('RELEASE_VERSION', appInfo.version || 'UNKNOWN');
}
