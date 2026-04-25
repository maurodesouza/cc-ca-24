import { Account } from "../src/domain/account";

const validAccount = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

describe("Account", () => {
  test("Deve criar uma conta", () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document);

    expect(account.getAccountId()).toBeDefined();
    expect(account.getName()).toBe(validAccount.name);
    expect(account.getEmail()).toBe(validAccount.email);
    expect(account.getDocument()).toBe(validAccount.document);
  });
});
