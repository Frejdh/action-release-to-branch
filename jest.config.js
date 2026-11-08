import { createDefaultEsmPreset } from 'ts-jest';

/** @type {import('jest').Config} */
export default {
	...createDefaultEsmPreset(),
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testMatch: ['**/__tests__/**/*.spec.ts'],
	// ESM imports name the emitted `.js` file, which is a `.ts` file in the sources
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
};
