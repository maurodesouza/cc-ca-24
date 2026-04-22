const VALID_LENGTH = 11;

export function isValidCpf(cpf: string) {
	if (!cpf) return false;

	cpf = extractOnlyNumbers(cpf);

	if (cpf.length !== VALID_LENGTH) return false;
	if (allDigitsTheSame(cpf)) return false;

	const digit1 = calculateDigit(cpf, 10);
	const digit2 = calculateDigit(cpf, 11);

	return extractLast2Digits(cpf) === `${digit1}${digit2}`;
}

function extractOnlyNumbers(cpf: string) {
	return cpf.replace(/\D/g, "");
}

function allDigitsTheSame(cpf: string) {
	const [firstDigit] = cpf;
	return [...cpf].every(digit => digit === firstDigit);
}

function calculateDigit(cpf: string, factor: number) {
	let total = 0;

	for (const digit of cpf) {
		if (factor > 1) total += parseInt(digit) * factor--;
	}

	const rest = total % VALID_LENGTH;
	return (rest < 2) ? 0 : VALID_LENGTH - rest;
}

function extractLast2Digits(cpf: string) {
	return cpf.slice(VALID_LENGTH - 2);
}
