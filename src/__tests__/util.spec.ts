
export function getTestResource(...morePaths: any[]): any {
	const baseDir = '/src/__tests__/resources';
	return `${baseDir}/${morePaths.join('/')}`;
}
