/**
 * Get the current environment.
 * @return {Env}
 */
export function getEnv() {
	return process.env;
}

/**
 * Relative to the working directory of the application.
 * @return {string}
 */
export function getNodeBuildTargetDirectory() {
	return getEnv().nodeBuildTargetDir || '.';
}


/**
 * @return {RegExp[]}
 */
export function getNodeFilesToKeepPatterns() {
	return (getEnv().nodeFilesToKeep || '').split(",").map(it => new RegExp(it.trim()));
}

/**
 * @return {boolean}
 */
export function shouldDeleteOldNodeFiles() {
	return getEnv().deleteOldNodeFiles ?? true;
}