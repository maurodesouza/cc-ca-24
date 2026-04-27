import { SignUp } from "../src/application/use-cases/signup";
import { Deposit } from "../src/application/use-cases/deposit";
import { GetAccount } from "../src/application/use-cases/get-account";
import { PGPromiseAdapter } from "../src/infra/database/pg-promise-adapter";
import { AccountRepositoryORM } from "../src/infra/repository/account-repository";
import { WalletRepositoryDatabase } from "../src/infra/repository/wallet-repository";
import { Registry } from "../src/infra/di/registry";
import { ORM } from "../src/infra/orm/orm";

let deposit: Deposit;
let signUp: SignUp;
let getAccount: GetAccount;

let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("accountRepository", new AccountRepositoryORM());
  Registry.getInstance().register("walletRepository", new WalletRepositoryDatabase());
  Registry.getInstance().register("deposit", new Deposit());
  Registry.getInstance().register("signUp", new SignUp());
  Registry.getInstance().register("getAccount", new GetAccount());

  deposit = new Deposit();
  signUp = new SignUp();
  getAccount = new GetAccount();
});

afterEach(async () => {
  Registry.getInstance().dependencies.clear();
  await pgPromiseAdapter.close();
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
