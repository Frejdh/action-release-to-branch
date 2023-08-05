import { log } from "./util/cmd.js";
import { checkoutBranch, createTag, isTagOnRemote, pushToRemote } from "./util/git.js";
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
	const isPushingWithForce = asBoolean(pushWithForce);
	if (isAllowedPattern) {
		await checkoutBranch(defaultBranch);

		if (isPushingWithForce || !(await isTagOnRemote(releaseVersion))) {
			await createTag(releaseVersion, `Release for version ${releaseVersion}`);
			await pushToRemote(isPushingWithForce, releaseVersion);
		}
		else {
			await log(`Tag [${releaseVersion}] was not created as it exists already. Please enable override option, or delete the existing one on the remote`);
		}

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
