import { Withdraw } from "../src/application/use-cases/withdraw";
import { SignUp } from "../src/application/use-cases/signup";
import { Deposit } from "../src/application/use-cases/deposit";
import { GetAccount } from "../src/application/use-cases/get-account";
import { PGPromiseAdapter } from "../src/infra/database/pg-promise-adapter";
import { AccountRepositoryORM } from "../src/infra/repository/account-repository";
import { WalletRepositoryORM } from "../src/infra/repository/wallet-repository";
import { Registry } from "../src/infra/di/registry";
import { ORM } from "../src/infra/orm/orm";

let withdraw: Withdraw;
let deposit: Deposit;
let signUp: SignUp;
let getAccount: GetAccount;
let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("accountRepository", new AccountRepositoryORM());
  Registry.getInstance().register("walletRepository", new WalletRepositoryORM());
  Registry.getInstance().register("withdraw", new Withdraw());
  Registry.getInstance().register("deposit", new Deposit());
  Registry.getInstance().register("signUp", new SignUp());
  Registry.getInstance().register("getAccount", new GetAccount());

  withdraw = new Withdraw();
  deposit = new Deposit();
  signUp = new SignUp();
  getAccount = new GetAccount();
});

afterEach(async () => {
  Registry.getInstance().dependencies.clear();
  await pgPromiseAdapter.close();
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
      quantity: 500
    }

    await deposit.execute(depositInput);

    const withdrawInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 400
    }

    await withdraw.execute(withdrawInput);

    const getAccountOutput = await getAccount.execute(accountOutput.accountId);

    expect(getAccountOutput.balances[0].assetId).toBe(withdrawInput.assetId);
    expect(getAccountOutput.balances[0].quantity).toBe(100);
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
