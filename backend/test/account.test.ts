import { Account } from "../src/domain/account";
import { Order } from "../src/domain/order";

const validAccount = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

describe("Account", () => {
  test("Deve criar depositos", async () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)

    account.deposit("BTC", 1000);
    account.deposit("BTC", 1000);

    expect(account.getAvailableBalanceByAssetId("BTC")).toBe(2000);
  });

  test("Não deve depositar com quantidade invalida", async () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)

    expect(() => account.deposit("BTC", -1000)).toThrow("Invalid quantity");
  });

  test("Não deve criar um deposito com asset invalido", async () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)

    expect(() => account.deposit("ABC", 1000)).toThrow("Invalid asset");
  });

  test("Deve criar um saque", () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)

    account.deposit("BTC", 1000);
    account.withdraw("BTC", 1000);

    expect(account.getAvailableBalanceByAssetId("BTC")).toBe(0);
  });

  test("Não deve criar um saque com saldo insuficiente", () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)

    expect(() => account.withdraw("BTC", 1000)).toThrow("Insufficient funds");
  });

  test("Deve validar o saldo disponivel para a criação de uma ordem", () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)

    account.deposit("USD", 10000);
    const order = Order.create(account.getAccountId(), "BTC-USD", "buy", 1, 5000)

    expect(account.blockOrder(order)).toBe(true);
    expect(account.getAvailableBalanceByAssetId("USD")).toBe(5000);
  })

  test("Não deve ter saldo suficiente para a criação de uma ordem", () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)

    account.deposit("USD", 1000);
    const order = Order.create(account.getAccountId(), "BTC-USD", "buy", 1, 5000)

    expect(account.blockOrder(order)).toBe(false);
    expect(account.getAvailableBalanceByAssetId("USD")).toBe(1000);
  })

  test("Não deve ter saldo suficiente para a criação de duas ordens", () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)
    account.deposit("USD", 6000);

    const order1 = Order.create(account.getAccountId(), "BTC-USD", "buy", 1, 5000)
    expect(account.blockOrder(order1)).toBe(true);
    expect(account.getAvailableBalanceByAssetId("USD")).toBe(1000);

    const order2 = Order.create(account.getAccountId(), "BTC-USD", "buy", 1, 5000)
    expect(account.blockOrder(order2)).toBe(false);
    expect(account.getAvailableBalanceByAssetId("USD")).toBe(1000);
  })
});
