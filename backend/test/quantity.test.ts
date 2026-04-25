import { Quantity } from "../src/domain/quantity";

describe("Quantity", () => {
  test("Deve criar uma quantidade válida", () => {
    const quantity = new Quantity(100);
    const quantityZero = new Quantity(0);

    expect(quantity.getValue()).toBe(100);
    expect(quantityZero.getValue()).toBe(0);
  });

  test("Não deve criar uma quantidade com valores inválidos", () => {
    expect(() => new Quantity(-1)).toThrow("Value must be positive");
    expect(() => new Quantity(null as any)).toThrow("Value must be a number");
    expect(() => new Quantity(undefined as any)).toThrow("Value must be a number");
  });

  describe("add", () => {
    test("Deve somar duas quantidades", () => {
      const quantity1 = new Quantity(100);
      const quantity2 = new Quantity(50);
      const quantity3 = new Quantity(0);

      expect(quantity1.add(quantity3).getValue()).toBe(100);
      expect(quantity1.add(quantity2).getValue()).toBe(150);
      expect(quantity2.add(quantity3).getValue()).toBe(50);
    });
  });

  describe("subtract", () => {
    test("Deve subtrair duas quantidades", () => {
      const quantity1 = new Quantity(100);
      const quantity2 = new Quantity(50);
      const quantity3 = new Quantity(0);

      expect(quantity1.subtract(quantity2).getValue()).toBe(50);
      expect(quantity1.subtract(quantity3).getValue()).toBe(100);
      expect(quantity2.subtract(quantity3).getValue()).toBe(50);
    });

    test("Não deve subtrair resultando em valor negativo", () => {
      const quantity1 = new Quantity(50);
      const quantity2 = new Quantity(100);
      expect(() => quantity1.subtract(quantity2)).toThrow("Negative result");
    });
  });

  describe("isGreaterThan", () => {
    test("Deve comparar corretamente se é maior que outra quantidade", () => {
      const quantity1 = new Quantity(100);
      const quantity2 = new Quantity(50);
      const quantity3 = new Quantity(0);

      expect(quantity1.isGreaterThan(quantity2)).toBe(true);
      expect(quantity2.isGreaterThan(quantity1)).toBe(false);
      expect(quantity3.isGreaterThan(quantity1)).toBe(false);
    });
  });

  describe("isLessThan", () => {
    test("Deve comparar corretamente se é menor que outra quantidade", () => {
      const quantity1 = new Quantity(0);
      const quantity2 = new Quantity(50);
      const quantity3 = new Quantity(100);

      expect(quantity1.isLessThan(quantity2)).toBe(true);
      expect(quantity1.isLessThan(quantity3)).toBe(true);
      expect(quantity3.isLessThan(quantity2)).toBe(false);
    });
  });

  describe("isZero", () => {
    test("Deve retornar true quando é zero", () => {
      const quantity = new Quantity(0);
      const quantity2 = new Quantity(50);
      expect(quantity.isZero()).toBe(true);
      expect(quantity2.isZero()).toBe(false);
    });
  });
});
