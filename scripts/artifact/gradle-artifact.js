import {findFilesMatchingPattern} from "../util/cmd.js";
import {AbstractArtifact} from "./abstract-artifact.js";


export class GradleArtifact extends AbstractArtifact {
    /**
     * @return {Promise<string[]>} files to inspect (pom.xml). Path is relative to the root of the project directory
     */
    async getFilesToInspect() {
        return await findFilesMatchingPattern('*gradle.properties');
    }

}