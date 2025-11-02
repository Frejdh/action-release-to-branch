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
		const deleteOldNodeFiles = shouldDeleteOldNodeFiles()
		// TODO:
	}

	/**
	 * @param {string[]} content files
	 */
	async copyContent(content) {
		throw new Error('copyArtifacts() not implemented');
	}

}