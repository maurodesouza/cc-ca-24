export class Name {
  value: string;

  constructor(value: string) {
    if (!Name.validate(value)) {
      throw new Error("Invalid name");
    }

    this.value = value;
  }

  private static validate(name: string): boolean {
    if (!name) return false;
    name = name.trim();

    if (!name) return false;
    const names = name.split(" ");

    if (names.length < 2) return false;
    return true;
  }
}
