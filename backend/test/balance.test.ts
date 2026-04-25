import { Balance } from "../src/domain/balance";

describe("Balance", () => {
  describe("Creation", () => {
    test("Deve criar um balance", () => {
      const balance = Balance.create("BTC", 1000, 200);

      expect(balance.getAssetId()).toBe("BTC");
      expect(balance.getQuantity()).toBe(1000);
      expect(balance.getBlockedQuantity()).toBe(200);
      expect(balance.getAvailableQuantity()).toBe(800);
    });

    test("Não deve criar um balance com propriedades invalidas", () => {
      expect(() => Balance.create("ABC", 1000, 200)).toThrow("Invalid asset ID");
      expect(() => Balance.create("BTC", -1000, 200)).toThrow("Value must be positive");
      expect(() => Balance.create("BTC", 1000, -200)).toThrow("Value must be positive");
    });
  });

  describe("Deposit", () => {
    test("Deve adicionar quantidade ao balance com deposit", () => {
      const balance = Balance.create("BTC", 1000);
      balance.deposit(500);
      expect(balance.getQuantity()).toBe(1500);
      expect(balance.getAvailableQuantity()).toBe(1500);
    });

    test("Não deve fazer deposit com quantidade invalida", () => {
      const balance = Balance.create("BTC", 1000);
      expect(() => balance.deposit(-100)).toThrow("Value must be positive");
    });
  });

  describe("Withdraw", () => {
    test("Deve subtrair quantidade do balance com withdraw", () => {
      const balance = Balance.create("BTC", 1000);
      balance.withdraw(300);
      expect(balance.getQuantity()).toBe(700);
      expect(balance.getAvailableQuantity()).toBe(700);
    });

    test("Não deve fazer withdraw com quantidade invalida", () => {
      const balance = Balance.create("BTC", 1000);
      expect(() => balance.withdraw(-100)).toThrow("Value must be positive");
    });

    test("Não deve fazer withdraw sem fundos suficientes", () => {
      const balance = Balance.create("BTC", 1000);
      expect(() => balance.withdraw(1500)).toThrow("Insufficient funds");
    });

    test("Não deve fazer withdraw sem fundos suficientes quando tiver quantidade bloqueada", () => {
      const balance = Balance.create("BTC", 1000, 300);
      expect(() => balance.withdraw(800)).toThrow("Insufficient funds");
    });
  });

  describe("Block", () => {
    test("Deve bloquear quantidade com block", () => {
      const balance = Balance.create("BTC", 1000);
      balance.block(300);
      expect(balance.getBlockedQuantity()).toBe(300);
      expect(balance.getAvailableQuantity()).toBe(700);
    });

    test("Não deve bloquear quantidade invalida", () => {
      const balance = Balance.create("BTC", 1000);
      expect(() => balance.block(-100)).toThrow("Value must be positive");
    });

    test("Não deve bloquear quantidade maior que disponível", () => {
      const balance = Balance.create("BTC", 1000);
      expect(() => balance.block(1500)).toThrow("Insufficient funds");
    });
  });

  describe("Unblock", () => {
    test("Deve desbloquear quantidade com unblock", () => {
      const balance = Balance.create("BTC", 1000, 300);
      balance.unblock(200);
      expect(balance.getBlockedQuantity()).toBe(100);
      expect(balance.getAvailableQuantity()).toBe(900);
    });

    test("Não deve desbloquear quantidade invalida", () => {
      const balance = Balance.create("BTC", 1000, 300);
      expect(() => balance.unblock(-100)).toThrow("Value must be positive");
    });

    test("Não deve desbloquear quantidade maior que bloqueada", () => {
      const balance = Balance.create("BTC", 1000, 300);
      expect(() => balance.unblock(500)).toThrow("Insufficient blocked funds");
    });
  });
});
