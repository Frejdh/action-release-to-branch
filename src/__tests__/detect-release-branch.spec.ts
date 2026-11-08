import { afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { DetectBranchEnv } from "../@types/environment.js";

const exportVariable = jest.fn();

jest.unstable_mockModule('@actions/core', () => ({
	exportVariable,
}));

const { default: detectReleaseBranch } = await import("../detect-release-branch.js");

describe('Detect release branch', () => {

	const ORIGINAL_ENV = process.env;
	beforeEach(() => {
		exportVariable.mockClear();
		process.env = { ...ORIGINAL_ENV };
	});
	afterAll(() => {
		process.env = ORIGINAL_ENV;
	});

	async function detectWith(env: DetectBranchEnv): Promise<unknown> {
		process.env = { ...process.env, ...env };
		await detectReleaseBranch();
		return exportVariable.mock.calls.at(-1)?.[1];
	}

	it('uses the configured branch for Node projects', async () => {
		expect(await detectWith({ projectFramework: 'Node', nodeBranch: 'master' })).toBe('master');
	});

	it('falls back to the releases branch for Node projects without a configured branch', async () => {
		expect(await detectWith({ projectFramework: 'Node', nodeBranch: '' })).toBe('releases');
	});

	it('uses the branch of the matching framework only', async () => {
		expect(await detectWith({ projectFramework: 'Maven', mavenBranch: 'maven-releases', nodeBranch: 'master' })).toBe('maven-releases');
	});

});