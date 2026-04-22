const MIN_NAMES = 2;

export function isValidName(name: string) {
	if (!name) return false;
	name = name.trim();

	if (!name) return false;
	const names = name.split(" ");

	if (names.length < MIN_NAMES) return false;
	return true;
}
