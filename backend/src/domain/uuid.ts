export class UUID {
  value: string;

  constructor(value: string) {
    if (!UUID.validate(value)) {
      throw new Error("Invalid UUID");
    }
    
    this.value = value;
  }

  static create(): UUID {
    const value = crypto.randomUUID();
    return new UUID(value);
  }

  private static validate(uuid: string): boolean {
    if (!uuid) return false;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
