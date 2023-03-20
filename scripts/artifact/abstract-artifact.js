
export class AbstractArtifact {

    /**
     * @return {Promise<string[]>} files to inspect. Path is relative to the root of the project directory
     */
    async getFilesToInspect() {
        throw new Error(`getFilesToInspect() not implemented`);
    }

    /**
     *
     * @param {string[]} filesToInspect=[] files
     * @return {Artifact[]} artifacts
     */
    async getArtifactsToCopy(filesToInspect = []) {
        throw new Error('getArtifactsToCopy() not implemented');
    }

    /**
     * @param {Artifact[]} artifacts
     */
    async copyArtifacts(artifacts) {
        throw new Error('copyArtifacts() not implemented');
    }

}