export interface FindFilesOptions {
	/**
	 * Bash `find -iname <value>` syntax
	 */
	include: string | string[];

	/**
	 * Bash `find -not -path <value>` syntax
	 */
	exclude?: string | string[];

	/**
	 * The working directory.
	 */
	cwd?: string;

	/**
	 * The maximum directory depth to recursively look for the files.
	 * @default 3
	 */
	maxDepth?: number;
}