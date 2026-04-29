import { Wallet } from "../../src/domain/wallet";
import { Order } from "../../src/domain/order";
import { UUID } from "../../src/domain/uuid";

const accountId = UUID.create().value;

describe("Wallet", () => {
  test("Deve criar depositos", async () => {
    const wallet = Wallet.create(accountId);

    wallet.deposit("BTC", 1000);
    wallet.deposit("BTC", 1000);

    expect(wallet.getAvailableBalanceByAssetId("BTC")).toBe(2000);
  });

  test("Não deve depositar com quantidade invalida", async () => {
    const wallet = Wallet.create(UUID.create().value);

    expect(() => wallet.deposit("BTC", -1000)).toThrow("Invalid quantity");
  });

  test("Não deve criar um deposito com asset invalido", async () => {
    const wallet = Wallet.create(UUID.create().value);

    expect(() => wallet.deposit("ABC", 1000)).toThrow("Invalid asset");
  });

  test("Deve criar um saque", () => {
    const wallet = Wallet.create(UUID.create().value);

    wallet.deposit("BTC", 1000);
    wallet.withdraw("BTC", 1000);

    expect(wallet.getAvailableBalanceByAssetId("BTC")).toBe(0);
  });

  test("Não deve criar um saque com saldo insuficiente", () => {
    const wallet = Wallet.create(UUID.create().value);

    expect(() => wallet.withdraw("BTC", 1000)).toThrow("Insufficient funds");
  });

  test("Deve validar o saldo disponivel para a criação de uma ordem", () => {
    const accountId = UUID.create().value;
    const wallet = Wallet.create(accountId);

    wallet.deposit("USD", 10000);
    const order = Order.create(accountId, "BTC-USD", "buy", 1, 5000)

    expect(wallet.blockOrder(order)).toBe(true);
    expect(wallet.getAvailableBalanceByAssetId("USD")).toBe(5000);
  })

  test("Não deve ter saldo suficiente para a criação de uma ordem", () => {
    const accountId = UUID.create().value;
    const wallet = Wallet.create(accountId);

    wallet.deposit("USD", 1000);
    const order = Order.create(accountId, "BTC-USD", "buy", 1, 5000)

    expect(wallet.blockOrder(order)).toBe(false);
    expect(wallet.getAvailableBalanceByAssetId("USD")).toBe(1000);
  })

  test("Não deve ter saldo suficiente para a criação de duas ordens", () => {
    const accountId = UUID.create().value;
    const wallet = Wallet.create(accountId);
    wallet.deposit("USD", 6000);

    const order1 = Order.create(accountId, "BTC-USD", "buy", 1, 5000)
    expect(wallet.blockOrder(order1)).toBe(true);
    expect(wallet.getAvailableBalanceByAssetId("USD")).toBe(1000);

    const order2 = Order.create(accountId, "BTC-USD", "buy", 1, 5000)
    expect(wallet.blockOrder(order2)).toBe(false);
    expect(wallet.getAvailableBalanceByAssetId("USD")).toBe(1000);
  })
});
