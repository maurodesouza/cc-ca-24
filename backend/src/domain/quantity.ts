export class Quantity {
  private value: number;

  constructor(value: number) {
    Quantity.validate(value);
    this.value = value;
  }

  static validate(quantity: number) {
    if (typeof quantity !== "number" || isNaN(quantity)) {
      throw new Error("Value must be a number");
    }
    if (quantity < 0) {
      throw new Error("Value must be positive");
    }
  }

  add(other: Quantity) {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity) {
    const result = this.value - other.value;
    if (result < 0) throw new Error("Negative result");
    return new Quantity(result);
  }

  isGreaterThan(other: Quantity) {
    return this.value > other.value;
  }

  isLessThan(other: Quantity) {
    return this.value < other.value;
  }

  isZero() {
    return this.value === 0;
  }

  getValue() {
    return this.value;
  }
}
