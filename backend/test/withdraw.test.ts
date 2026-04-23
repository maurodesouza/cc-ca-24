import { AccountDAODatabase } from "../src/account-DAO";
import { Withdraw } from "../src/withdraw";
import { FundDAOInMemory } from "../src/fund-DAO";
import { SignUp } from "../src/signup";
import { Deposit } from "../src/deposit";

let withdraw: Withdraw;
let deposit: Deposit;
let signUp: SignUp;

beforeEach(() => {
  const fundDAO = new FundDAOInMemory();
  const accountDAO = new AccountDAODatabase();

  withdraw = new Withdraw(fundDAO, accountDAO);
  deposit = new Deposit(fundDAO, accountDAO);
  signUp = new SignUp(accountDAO);
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

    const input = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 1000
    }

    await deposit.execute(input);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 1000
    }

    const withdrawOutput = await withdraw.execute(fundInput);

    expect(withdrawOutput.accountId).toBe(fundInput.accountId);
    expect(withdrawOutput.assetId).toBe(fundInput.assetId);
    expect(withdrawOutput.quantity).toBe(-fundInput.quantity);
  });

  test("Não deve criar um saque com conta inexistente", async () => {
    const fundInput = {
      accountId: crypto.randomUUID(),
      assetId: "BTC",
      quantity: 1000
    }

    await expect(() => withdraw.execute(fundInput)).rejects.toThrow("Account not found");
  });

  test("Não deve criar um saque com asset invalido", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "ABC",
      quantity: 1000
    }
    await expect(() => withdraw.execute(fundInput)).rejects.toThrow("Invalid asset");
  });

  test("Não deve criar um saque com saldo insuficiente", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await signUp.execute(accountInput);

    const inputs = [
      {
        fundId: crypto.randomUUID(),
        accountId: accountOutput.accountId,
        assetId: "BTC",
        quantity: 200
      },
      {
        fundId: crypto.randomUUID(),
        accountId: accountOutput.accountId,
        assetId: "BTC",
        quantity: 300
      },
    ]

    await Promise.all(inputs.map(async (input) => {
      await deposit.execute(input);
    }));

    const fundInput = {
      fundId: crypto.randomUUID(),
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 501
    }

    await expect(() => withdraw.execute(fundInput)).rejects.toThrow("Insufficient balance");
  });
});
