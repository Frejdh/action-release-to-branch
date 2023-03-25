import { log } from "./util/cmd.js";
import { checkoutBranch, createTag, pushToRemote } from "./util/git.js";
import { asBoolean } from "./util/convert.js";

// https://github.com/actions/github-script
export default async function script() {
	const {
		defaultBranch,
		releaseVersion,
		pushWithForce,
		allowedTagPattern,
	} = process.env;

	const isAllowedPattern = await checkIfAllowedTagPattern(allowedTagPattern, releaseVersion);
	if (isAllowedPattern) {
		await checkoutBranch(defaultBranch);
		await createTag(releaseVersion, `Release for version ${releaseVersion}`);
		await pushToRemote(asBoolean(pushWithForce), releaseVersion);
	}
}

async function checkIfAllowedTagPattern(pattern, version) {
	if (!pattern) {
		await log('No version pattern supplied, meaning no pattern check will be done. Tag will be created');
		return true;
	} else if (new RegExp(pattern, 'g').test(version)) {
		await log(`The version ${version} contained the pattern [${pattern}]. Tag will be created`);
		return true;
	}

	await log(`The version ${version} didn't contain the pattern [${pattern}]. Skipping tag creation`);
	return false;
}
