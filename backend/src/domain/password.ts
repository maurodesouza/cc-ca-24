const MIN_LENGTH = 8;

export class Password {
  value: string;

  constructor(value: string) {
    console.log('value', value)

    if (!Password.validate(value)) {
      throw new Error("Invalid password");
    }

    this.value = value;
  }

  private static validate(password: string): boolean {
    if (!password) return false;
    if (password.length < MIN_LENGTH) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;

    return true;
  }
}
