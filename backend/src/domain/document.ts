const VALID_LENGTH = 11;

export class Document {
  value: string;

  constructor(value: string) {
    if (!Document.validate(value)) {
      throw new Error("Invalid document");
    }
    
    this.value = value;
  }

  private static validate(cpf: string): boolean {
    if (!cpf) return false;

    cpf = Document.extractOnlyNumbers(cpf);

    if (cpf.length !== VALID_LENGTH) return false;
    if (Document.allDigitsTheSame(cpf)) return false;

    const digit1 = Document.calculateDigit(cpf, 10);
    const digit2 = Document.calculateDigit(cpf, 11);

    return Document.extractLast2Digits(cpf) === `${digit1}${digit2}`;
  }

  private static extractOnlyNumbers(cpf: string) {
    return cpf.replace(/\D/g, "");
  }

  private static allDigitsTheSame(cpf: string) {
    const [firstDigit] = cpf;
    return [...cpf].every(digit => digit === firstDigit);
  }

  private static calculateDigit(cpf: string, factor: number) {
    let total = 0;

    for (const digit of cpf) {
      if (factor > 1) total += parseInt(digit) * factor--;
    }

    const rest = total % VALID_LENGTH;
    return (rest < 2) ? 0 : VALID_LENGTH - rest;
  }

  private static extractLast2Digits(cpf: string) {
    return cpf.slice(VALID_LENGTH - 2);
  }
}
