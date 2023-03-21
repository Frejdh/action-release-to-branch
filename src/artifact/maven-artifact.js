import {execAndGetOutput, findFilesMatchingPattern, getWorkingDirectory, log} from "../util/cmd.js";
import {AbstractArtifact} from "./abstract-artifact.js";
import {Artifact} from "./model/artifact.js";
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
            const groupId = await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=project.groupId', '-q', '-DforceStdout', '-f', pomFile]);
            const artifactId = await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=project.artifactId', '-q', '-DforceStdout', '-f', pomFile]);
            const version = await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=project.version', '-q', '-DforceStdout', '-f', pomFile]);

            const artifact = new Artifact(groupId, artifactId, version);
            await log(`Resolved artifact [${artifact.toString()}]`);
            artifacts.push(artifact)
        }

        return artifacts;
    }

    /**
     * @param {Artifact[]} artifacts
     */
    async copyArtifacts(artifacts) {
        const m2RepositoryDirectory = await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=settings.localRepository', '-q', '-DforceStdout']);
        for (let artifact of artifacts) {
            const artifactRelativeDirectory = artifact.toDirectoryPath();
            const targetDirectory = `${await getWorkingDirectory()}/${artifactRelativeDirectory}`;

            await execAndGetOutput('mkdir', ['-p', `${targetDirectory}`]);
            await execAndGetOutput('cp ', ['-r', `${m2RepositoryDirectory}/${artifactRelativeDirectory}`, `${targetDirectory}`]);

            core.debug(`Copied artifact files for [${artifact.toString()}`);  // Not working???
            await log(`Copied artifact files for [${artifact.toString()}] to [${targetDirectory}]`);
        }
    }
}