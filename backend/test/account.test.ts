import { Account } from "../src/account";

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

    expect(account.getBalance("BTC")).toBe(2000);
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

    expect(account.getBalance("BTC")).toBe(0);
  });

  test("Não deve criar um saque com saldo insuficiente", () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document)

    expect(() => account.withdraw("BTC", 1000)).toThrow("Insufficient funds");
  });
});
