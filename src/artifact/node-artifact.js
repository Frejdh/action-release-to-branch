import { execAndGetOutput, findFilesMatchingPattern, getAppRepositoryDirectory, getReleaseRepositoryDirectory, log, readPackageJson } from "../util/cmd.js";
import { getNodeBuildTargetDirectory, getNodeFilesToKeepPatterns, shouldDeleteOldNodeFiles } from "../util/env.js";
import { AbstractArtifact } from "./abstract-artifact.js";


export class NodeArtifact extends AbstractArtifact {

	/**
	 * @return {Promise<string[]>} files
	 */
	async getContentToCopy(filesToInspect = []) {
		const appDir = await getAppRepositoryDirectory();
		const buildDirectory = `${appDir}/${getNodeBuildTargetDirectory()}`;
		return findFilesMatchingPattern('*', buildDirectory);
	}

	async preprocessBeforeCopy() {
		const deleteOldNodeFiles = shouldDeleteOldNodeFiles();
		await log('deleteOldNodeFiles', deleteOldNodeFiles);

		if (deleteOldNodeFiles) {
			const appDir = await getAppRepositoryDirectory();
			const allFiles = await findFilesMatchingPattern("*", appDir);
			const filesToKeep = getNodeFilesToKeepPatterns();
			const filesToDelete = allFiles.filter(it => !filesToKeep.some(pattern => pattern.exec(it)))
			await log('FILES TO DELETE', filesToDelete);

			await log(`${filesToDelete.length} of old directory files will be deleted`);
		} else {
			await log("Files will not be deleted as the flag to disable this behavior was set");
		}


		// TODO:
	}

	/**
	 * @param {string[]} files files
	 */
	async copyContent(files) {
		await log('Copying files:', files);
		const appDir = await getAppRepositoryDirectory();
		const releaseDir = await getReleaseRepositoryDirectory();
		const buildDir = getNodeBuildTargetDirectory();

		await execAndGetOutput('cp ', ['-r', '-T', `${appDir}/${buildDir}/.`, releaseDir])
	}

	/**
	 * @param {(Artifact | string)[]} artifactsOrFiles files or artifacts
	 * @return {AppInfo}
	 */
	async getAppInfo(artifactsOrFiles) {
		const packageJson = readPackageJson();

		if (!packageJson) {
			throw new Error("Failed to read package JSON file. See error logs above...");
		}

		return {
			name: packageJson.name,
			version: packageJson.version,
		};
	}

}