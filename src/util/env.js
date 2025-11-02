
/**
 * Relative to the working directory of the application.
 * @return {string}
 */
export function getNodeBuildTargetDirectory() {
	return process.env.nodeBuildTargetDir || '.';
}


/**
 * @return {RegExp[]}
 */
export function getNodeFilesToKeepPatterns() {
	return (process.env.nodeFilesToKeep || '').split(",").map(it => new RegExp(it.trim()));
}

/**
 * @return {boolean}
 */
export function shouldDeleteOldNodeFiles() {
	return process.env.deleteOldNodeFiles ?? true;
}