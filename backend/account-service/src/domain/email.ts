export class Email {
  value: string;

  constructor(value: string) {
    if (!Email.validate(value)) {
      throw new Error("Invalid email");
    }
    
    this.value = value;
  }

  private static validate(email: string): boolean {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
