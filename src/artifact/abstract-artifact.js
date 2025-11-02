export class AbstractArtifact {

	/**
	 * @return {Promise<string[]>} files to inspect. Path is relative to the root of the project directory
	 */
	async getFilesToInspect() {
		return [];
	}

	async preprocessBeforeCopy() {}

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
	 * @param {(Artifact | string)[]} content files or artifacts
	 */
	async copyContent(content) {
		throw new Error('copyArtifacts() not implemented');
	}

}