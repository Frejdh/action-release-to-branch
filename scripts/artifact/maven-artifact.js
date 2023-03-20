import {execAndGetOutput, findFilesMatchingPattern} from "../util/cmd";
import {AbstractArtifact} from "./abstract-artifact";
import {Artifact} from "./model/artifact";
import * as core from '@actions/core';


export class MavenArtifact extends AbstractArtifact {
    /**
     * @return {Promise<string[]>} files to inspect (pom.xml). Path is relative to the root of the project directory
     */
    async getFilesToInspect() {
        return await findFilesMatchingPattern('*pom.xml');
    }

    /**
     *
     * @param {string[]} filesToInspect=[] pom.xml files
     * @return {Artifact[]} artifacts
     */
    async getArtifactsToCopy(filesToInspect = []) {
        const artifacts = []

        for (let pomFile of filesToInspect) {
            let commandOutput = await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=project.groupId', '-q', '-DforceStdout', '-f', pomFile]);
            commandOutput += await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=project.artifactId', '-q', '-DforceStdout', '-f', pomFile]);
            commandOutput += await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=project.version', '-q', '-DforceStdout', '-f', pomFile]);
            artifacts.push(Artifact.fromString(commandOutput.replace('\n', '')))
        }

        return artifacts;
    }

    /**
     * @param {Artifact[]} artifacts
     */
    async copyArtifacts(artifacts) {
        const m2Directory = await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=settings.localRepository', '-q', '-DforceStdout']);
        for (let artifact of artifacts) {
            const artifactDirectory = artifact.toString().replace(':', '/');
            await execAndGetOutput('mkdir', ['-p', `"${artifactDirectory}"`]);
            await execAndGetOutput('cp ', [`"${m2Directory}/${artifactDirectory}"/*`, `${artifactDirectory}`]);
            core.debug(`Copied artifact files for [${artifact.toString()}`);
        }
    }
}