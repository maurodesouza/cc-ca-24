import { AccountRepositoryDatabase } from "../src/account-repository";
import { Withdraw } from "../src/withdraw";
import { SignUp } from "../src/signup";
import { Deposit } from "../src/deposit";
import { GetAccount } from "../src/get-account";

let withdraw: Withdraw;
let deposit: Deposit;
let signUp: SignUp;
let getAccount: GetAccount;

beforeEach(() => {
  const accountRepository = new AccountRepositoryDatabase();

  withdraw = new Withdraw(accountRepository);
  deposit = new Deposit(accountRepository);
  signUp = new SignUp(accountRepository);
  getAccount = new GetAccount(accountRepository);
});

describe("Withdraw", () => {
  test("Deve criar um saque", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const depositInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 1000
    }

    await deposit.execute(depositInput);

    const withdrawInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 500
    }

    await withdraw.execute(withdrawInput);

    const getAccountOutput = await getAccount.execute(accountOutput.accountId);

    expect(getAccountOutput.balances[1].assetId).toBe(withdrawInput.assetId);
    expect(getAccountOutput.balances[1].quantity).toBe(-withdrawInput.quantity);
  });

  test("Não deve criar um saque com conta inexistente", async () => {
    const fundInput = {
      accountId: crypto.randomUUID(),
      assetId: "BTC",
      quantity: 1000
    }

    await expect(() => withdraw.execute(fundInput)).rejects.toThrow("Account not found");
  });

  test("Não deve criar um saque sem um deposito previo", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const withdrawInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 1
    }

    await expect(() => withdraw.execute(withdrawInput)).rejects.toThrow("Insufficient funds");
  });

  test("Não deve criar um saque com saldo insuficiente", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const depositInputs = [
      {
        accountId: accountOutput.accountId,
        assetId: "BTC",
        quantity: 200
      },
      {
        accountId: accountOutput.accountId,
        assetId: "BTC",
        quantity: 300
      },
    ]

    await Promise.all(depositInputs.map(async (input) => {
      await deposit.execute(input);
    }));

    const withdrawInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 501
    }

    await expect(() => withdraw.execute(withdrawInput)).rejects.toThrow("Insufficient funds");
  });
});
