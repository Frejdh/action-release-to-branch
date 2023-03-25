/**
 * Note, doesn't check for 'truthy' values, but rather typical 'boolean-ish' inputs
 * @param {any?} value Any value
 * @return {boolean} Boolean value
 */
export function asBoolean(value) {
	switch (value?.toString()?.toLowerCase()?.trim()) {
		case 'true':
		case 'yes':
		case 'y':
		case '1':
			return true;
		default:
			return false;
	}
}