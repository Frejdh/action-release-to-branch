import { existsSync } from "node:fs";
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
			const releaseDir = await getReleaseRepositoryDirectory();
			const allFiles = await findFilesMatchingPattern("*", releaseDir);
			const filePatternsForKeepingFiles = getNodeFilesToKeepPatterns();

			/** @type {string[]} */
			const filesToKeep = [];
			/** @type {string[]} */
			const filesToDelete = [];

			allFiles.forEach(file => {
				if (filePatternsForKeepingFiles.some(pattern => pattern.exec(file.replace(`${releaseDir}/`, '')))) {
					filesToKeep.push(file);
				} else {
					filesToDelete.push(file);
				}
			});

			await log(`Keeping ${filesToKeep.length} files:`, filesToKeep.map(it => it.replace(`${releaseDir}/`, '')));
			await log(`Deleting ${filesToDelete.length} files:`, filesToDelete.map(it => it.replace(`${releaseDir}/`, '')));
		} else {
			await log("Files will not be deleted as the flag to disable this behavior was set");
		}
	}

	/**
	 * @param {string[]} files files
	 */
	async copyContent(files) {
		await log('Copying files:', files);
		const appDir = await getAppRepositoryDirectory();
		const releaseDir = await getReleaseRepositoryDirectory();
		const buildDir = getNodeBuildTargetDirectory();

		for (const file of files) {
			const relativeFilePath = file.replace(`${appDir}/${buildDir}/`, '');
			const relativeParentDir = relativeFilePath.includes('/') ? relativeFilePath.replaceAll(/(\/)(?!.*\/).+/g, '') : undefined;
			const targetParentDir = relativeParentDir ? `${releaseDir}/${relativeParentDir}` : undefined;

			if (targetParentDir && !existsSync(targetParentDir)) {
				await execAndGetOutput('mkdir', ['-p', targetParentDir]);
			}
			await execAndGetOutput('cp', [file, `${releaseDir}/${relativeFilePath}`])
		}
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