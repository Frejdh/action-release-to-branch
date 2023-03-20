import {execAndGetOutput, findFilesMatchingPattern} from "../util/cmd";
import {AbstractArtifact} from "./abstract-artifact";
import {Artifact} from "./model/artifact";
import * as core from '@actions/core';


export class GradleArtifact extends AbstractArtifact {
    /**
     * @return {Promise<string[]>} files to inspect (pom.xml). Path is relative to the root of the project directory
     */
    async getFilesToInspect() {
        return await findFilesMatchingPattern('*gradle.properties');
    }

}