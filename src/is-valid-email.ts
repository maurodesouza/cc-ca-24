export function isValidEmail(email: string) {
	if (!email) return false;

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}
