export class AbstractArtifact {

	/**
	 * @return {Promise<string[]>} files to inspect. Path is relative to the root of the project directory
	 */
	async getFilesToInspect() {
		return [];
	}

	async preprocessBeforeCopy() {
	}

	/**

	/**
	 *
	 * @param {string[]} filesToInspect files
	 * @return {Promise<(Artifact | string)[]>} files or artifacts
	 */
	async getContentToCopy(filesToInspect = []) {
		throw new Error('getContentToCopy() not implemented');
	}

	/**
	 * @param {(Artifact | string)[]} artifactsOrFiles files or artifacts
	 */
	async copyContent(artifactsOrFiles) {
		throw new Error('copyArtifacts() not implemented');
	}

	/**
	 * @param {(Artifact | string)[]} artifactsOrFiles files or artifacts
	 * @return {AppInfo}
	 */
	async getAppInfo(artifactsOrFiles) {
		throw new Error('getAppVersion() not implemented');
	}

}