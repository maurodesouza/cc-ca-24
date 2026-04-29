import { Withdraw } from "../../src/application/use-cases/withdraw";
import { Deposit } from "../../src/application/use-cases/deposit";
import { GetWallet } from "../../src/application/use-cases/get-wallet";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { WalletRepositoryORM } from "../../src/infra/repository/wallet-repository";
import { Registry } from "../../src/infra/di/registry";
import { ORM } from "../../src/infra/orm/orm";
import { AccountGatewayHTTP } from "../../src/infra/gateway/account-gateway";

let withdraw: Withdraw;
let deposit: Deposit;
let getWallet: GetWallet;
let accountGateway: AccountGatewayHTTP;
let pgPromiseAdapter: PGPromiseAdapter;
let walletRepository: WalletRepositoryORM;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  walletRepository = new WalletRepositoryORM();
  withdraw = new Withdraw();
  deposit = new Deposit();
  getWallet = new GetWallet();
  accountGateway = new AccountGatewayHTTP();

  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("walletRepository", walletRepository);
  Registry.getInstance().register("withdraw", withdraw);
  Registry.getInstance().register("deposit", deposit);
  Registry.getInstance().register("getWallet", getWallet);
  Registry.getInstance().register("accountGateway", accountGateway);
});

afterEach(async () => {
  await walletRepository.clear();
  await pgPromiseAdapter.close();
  Registry.getInstance().dependencies.clear();
});

describe("Withdraw", () => {
  test("Deve criar um saque", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await accountGateway.signup(accountInput);

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

    const getAccountOutput = await getWallet.execute(accountOutput.accountId);

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

    const accountOutput = await accountGateway.signup(accountInput);

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

    const accountOutput = await accountGateway.signup(accountInput);

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

    for (const input of depositInputs) {
      await deposit.execute(input);
    }

    const withdrawInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 501
    }

    await expect(() => withdraw.execute(withdrawInput)).rejects.toThrow("Insufficient funds");
  });
});
