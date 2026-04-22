const MIN_LENGTH = 8;

export function isValidPassword(password: string) {
	if (!password) return false;
	if (password.length < MIN_LENGTH) return false;
	if (!/[a-z]/.test(password)) return false;
	if (!/[A-Z]/.test(password)) return false;
	if (!/[0-9]/.test(password)) return false;

	return true;
}
