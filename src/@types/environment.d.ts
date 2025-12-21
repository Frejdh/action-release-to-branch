export interface DetectBranchEnv {
	projectFramework?: string;
	mavenBranch?: string;
	gradleBranch?: string;
	npmBranch?: string;
	pypiBranch?: string;
}

export interface DetectVersionEnv {
	projectFramework?: string;
	appDirectory?: string;
}

export interface CopyContentEnv {
	projectFramework?: string;
	appDirectory?: string;
	releaseDirectory?: string;
	projectCommitish?: string;
	releaseBranch?: string;
	nodeBuildTargetDir?: string;
	deleteOldNodeFiles?: string;
	nodeFilesToKeep?: string;
}

export interface TagEnv {
	workingDirectory?: string;
	projectCommitish?: string;
	releaseVersion?: string;
	allowedTagPattern?: string;
	pushWithForce?: string;
}

export interface Env extends DetectBranchEnv, DetectVersionEnv, CopyContentEnv, TagEnv { }

declare const process: {
	env: Env | { [key: string]: string | undefined };
}
