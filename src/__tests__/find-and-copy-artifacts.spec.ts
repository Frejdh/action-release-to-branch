import type { ExecOptions } from "@actions/exec";
import { afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { readdirSync } from "node:fs";
import type { CopyContentEnv } from "../@types/environment.js";
import { getTestResource } from "./test-util.js";

interface ExecutedCommand {
	readonly command: string;
	readonly args: readonly string[];
	readonly cwd: string | undefined;
}

const executedCommands: ExecutedCommand[] = [];

function listFilesRecursively(directory: string): string[] {
	return readdirSync(directory, { recursive: true, withFileTypes: true })
		.filter(entry => entry.isFile())
		.map(entry => `${entry.parentPath.replaceAll('\\', '/')}/${entry.name}`);
}

/**
 * Fakes the output of the shell commands whose output the scripts read. Other commands print nothing.
 */
function fakeCommandOutput(command: string, args: readonly string[]): string {
	switch (command) {
		case 'readlink':
			return args.at(-1) ?? '';
		case 'find':
			return listFilesRecursively(args[0] ?? '.').join('\n');
		default:
			return '';
	}
}

jest.unstable_mockModule('@actions/exec', () => ({
	exec: jest.fn(async (command: string, args: string[] = [], options?: ExecOptions): Promise<number> => {
		executedCommands.push({ command, args, cwd: options?.cwd });
		options?.listeners?.stdout?.(Buffer.from(fakeCommandOutput(command, args)));
		return 0;
	}),
}));

const { default: findAndCopyContent } = await import("../find-and-copy-content.js");

describe('Find and copy artifacts', () => {

	const APP_REPO = 'app_repo';
	const REL_REPO = 'release_repo';

	const ORIGINAL_ENV = process.env;
	beforeEach(() => {
		executedCommands.length = 0;
		process.env = { ...ORIGINAL_ENV };
	});
	afterAll(() => {
		process.env = ORIGINAL_ENV;
	});

	function modifyEnv(env: CopyContentEnv): void {
		process.env = {
			...process.env,
			...env
		};
	}

	describe('Node', () => {

		const appDirectory = getTestResource('node', APP_REPO);
		const releaseDirectory = getTestResource('node', REL_REPO);

		beforeEach(() => {
			modifyEnv({
				projectFramework: 'node',
				appDirectory,
				releaseDirectory,
				releaseBranch: 'test-release',
				projectCommitish: 'master',
				nodeBuildTargetDir: 'dist',
				deleteOldNodeFiles: 'false',
				nodeFilesToKeep: 'README.md'
			});
		});

		it('checks out both branches and copies the build output to the release repository', async () => {
			await findAndCopyContent();

			const gitAndCopyCommands = executedCommands.filter(({ command }) => command === 'git' || command === 'cp');
			expect(gitAndCopyCommands).toEqual([
				{ command: 'git', args: ['checkout', 'master'], cwd: appDirectory },
				{ command: 'git', args: ['checkout', 'test-release'], cwd: releaseDirectory },
				expect.objectContaining({
					command: 'cp',
					args: [`${appDirectory}/dist/index.html`, `${releaseDirectory}/index.html`]
				}),
			]);
		});

		it('keeps old files in the release repository when deleting them is disabled', async () => {
			await findAndCopyContent();

			expect(executedCommands.filter(({ command }) => command === 'rm')).toEqual([]);
		});

		it('deletes old files in the release repository that match no keep pattern when deleting them is enabled', async () => {
			modifyEnv({ deleteOldNodeFiles: 'true' });

			await findAndCopyContent();

			expect(executedCommands.filter(({ command }) => command === 'rm')).toEqual([
				expect.objectContaining({ args: [`${releaseDirectory}/.gitkeep`] }),
			]);
		});

	});

});
