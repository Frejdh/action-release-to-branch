import { execAndGetOutput, findFilesMatchingPattern, getAppRepositoryDirectory, log } from "../util/cmd.js";
import { getNodeBuildTargetDirectory, shouldDeleteOldNodeFiles } from "../util/env.js";
import { AbstractArtifact } from "./abstract-artifact.js";


export class NodeArtifact extends AbstractArtifact {

	/**
	 * @return {Promise<string[]>} files
	 */
	async getContentToCopy() {
		const cwd = await getAppRepositoryDirectory();
		const buildDirectory = `${cwd}/${getNodeBuildTargetDirectory()}`;
		return findFilesMatchingPattern('*', buildDirectory);
	}

	async preprocessBeforeCopy() {
		const deleteOldNodeFiles = shouldDeleteOldNodeFiles();
		console.log('deleteOldNodeFiles', deleteOldNodeFiles);
		// TODO:
	}

	/**
	 * @param {string[]} files files
	 */
	async copyContent(files) {
		console.log('files', files);
		//throw new Error('copyArtifacts() not implemented');
	}

	/**
	 * @param {(Artifact | string)[]} artifactsOrFiles files or artifacts
	 * @return {AppInfo}
	 */
	async getAppInfo(artifactsOrFiles) {
		const packageJson = require(`${await getAppRepositoryDirectory()}/package.json`);
		return {
			name: packageJson.name,
			version: packageJson.version,
		};
	}

}