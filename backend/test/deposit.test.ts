import { AccountRepositoryDatabase } from "../src/account-repository";

import { SignUp } from "../src/signup";
import { Deposit } from "../src/deposit";
import { GetAccount } from "../src/get-account";

let deposit: Deposit;
let signUp: SignUp;
let getAccount: GetAccount;

beforeEach(() => {
  const accountRepository = new AccountRepositoryDatabase();

  deposit = new Deposit(accountRepository);
  signUp = new SignUp(accountRepository);
  getAccount = new GetAccount(accountRepository);
});

describe("Deposit", () => {
  test("Deve criar um deposito", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 1000
    }

    await deposit.execute(fundInput);
    const getAccountOutput = await getAccount.execute(accountOutput.accountId);

    expect(getAccountOutput.balances[0].assetId).toBe(fundInput.assetId);
    expect(getAccountOutput.balances[0].quantity).toBe(fundInput.quantity);
  });

  test("Não deve criar um deposito com conta inexistente", async () => {
    const fundInput = {
      accountId: crypto.randomUUID(),
      assetId: "BTC",
      quantity: 1000
    }

    await expect(() => deposit.execute(fundInput)).rejects.toThrow("Account not found");
  });
});
