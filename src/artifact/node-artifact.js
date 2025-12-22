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
			await log(`Patterns: [${filePatternsForKeepingFiles.map(it => it.source).join('  ||  ')}]`);

			for (const file of allFiles) {
				const relativeFilePath = file.replace(`${releaseDir}/`, '');
				await log(`Testing file: ${relativeFilePath}`);
				if (filePatternsForKeepingFiles.some(pattern => pattern.exec(relativeFilePath))) {
					filesToKeep.push(file);
				} else {
					filesToDelete.push(file);
				}
			}

			await log(`Keeping ${filesToKeep.length} files:\n`, filesToKeep.map(it => it.replace(`${releaseDir}/`, '')).join('\n'));
			await log(`Deleting ${filesToDelete.length} files:\n`, filesToDelete.map(it => it.replace(`${releaseDir}/`, '')).join('\n'));
			for (const file of filesToDelete) {
				await execAndGetOutput('rm', [file], null, false)
			}
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
				await execAndGetOutput('mkdir', ['-p', targetParentDir], null, false);
			}
			await execAndGetOutput('cp', [file, `${releaseDir}/${relativeFilePath}`], null, false)
		}
	}

	/**
	 * @param {(Artifact | string)[]} artifactsOrFiles files or artifacts
	 * @return {AppInfo}
	 */
	async getAppInfo(artifactsOrFiles) {
		const packageJson = await readPackageJson();

		if (!packageJson) {
			throw new Error("Failed to read package JSON file. See error logs above...");
		}

		return {
			name: packageJson.name,
			version: packageJson.version,
		};
	}

}