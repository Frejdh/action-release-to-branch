import {execAndGetOutput, findFilesMatchingPattern, getWorkingDirectory} from "../util/cmd.js";
import {AbstractArtifact} from "./abstract-artifact.js";
import {Artifact} from "./model/artifact.js";
import * as core from '@actions/core';
import {exec} from "@actions/exec";


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
            artifacts.push(Artifact.fromString(commandOutput))
        }

        return artifacts;
    }

    /**
     * @param {Artifact[]} artifacts
     */
    async copyArtifacts(artifacts) {
        const m2RepositoryDirectory = await execAndGetOutput('mvn', ['help:evaluate', '-Dexpression=settings.localRepository', '-q', '-DforceStdout']);
        for (let artifact of artifacts) {
            const artifactRelativeDirectory = artifact.toString().replace(':', '/');
            const targetDirectory = `${await getWorkingDirectory()}}/${artifactRelativeDirectory}`;

            await execAndGetOutput('mkdir', ['-p', `"${targetDirectory}"`]);
            await execAndGetOutput('cp ', [`"${m2RepositoryDirectory}/${artifactRelativeDirectory}"/*`, `"${targetDirectory}"`]);qw

            core.debug(`Copied artifact files for [${artifact.toString()}`);  // Not working???
            await execAndGetOutput('echo', [`"Copied artifact files for [${artifact.toString()}] to [${targetDirectory}]"`])
        }
    }
}