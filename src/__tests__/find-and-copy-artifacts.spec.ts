import { CopyContentEnv } from "../@types/environment";
import { getTestResource } from "./util.spec";
import * as Script from "../find-and-copy-content";
import * as Cmd from "../util/cmd";

describe('Find and copy artifacts', () => {

	const APP_REPO = 'app_repo';
	const REL_REPO = 'release_repo';

	const ORIGINAL_ENV = process.env;
	beforeEach(() => {
		jest.resetModules();
		process.env = { ...ORIGINAL_ENV };
	});
	afterAll(() => {
		process.env = ORIGINAL_ENV;
	});

	let framework = spyOn(Script, 'getFramework').and.callThrough();
	let execAndGetOutput = spyOn(Cmd, 'execAndGetOutput').and.returnValue(Promise.resolve('OUTPUT'));

	function modifyEnv(env: CopyContentEnv): void {
		process.env = {
			...process.env,
			...env
		};
	}

	async function runScript(): Promise<void> {
		Script.default();
	}

	describe('Node', () => {

		beforeEach(() => {
			modifyEnv({
				projectFramework: 'node',
				appDirectory: getTestResource('node', APP_REPO),
				releaseDirectory: getTestResource('node', REL_REPO),
				releaseBranch: 'test-release',
				projectCommitish: 'master',
				nodeBuildTargetDir: 'dist',
				deleteOldNodeFiles: 'false',
				nodeFilesToKeep: 'README.md'
			});
		});

		it('success', async () => {
			await runScript();
		});

	});

});