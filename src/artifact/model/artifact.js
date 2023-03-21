export class Artifact {
    #groupId;
    #artifactId;
    #version;

    constructor(groupId, artifactId, version) {
        this.#groupId = groupId;
        this.#artifactId = artifactId;
        this.#version = version;
    }

    /**
     *
     * @param {string} artifactString
     * @return {Artifact} new instance
     */
    static fromString(artifactString) {
        const byColon = artifactString.split(':');
        return new this(byColon[0], byColon[1], byColon[2]);
    }

    get groupId() {
        return this.#groupId;
    }

    get artifactId() {
        return this.#artifactId;
    }

    get version() {
        return this.#version;
    }

    toString() {
        return `${this.groupId}:${this.artifactId}:${this.version}`
    }

}