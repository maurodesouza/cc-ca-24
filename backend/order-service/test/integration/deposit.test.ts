import { Deposit } from "../../src/application/use-cases/deposit";
import { GetWallet } from "../../src/application/use-cases/get-wallet";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { WalletRepositoryORM } from "../../src/infra/repository/wallet-repository";
import { Registry } from "../../src/infra/utils/registry";
import { ORM } from "../../src/infra/orm/orm";
import { AccountGatewayHTTP } from "../../src/infra/gateway/account-gateway";

let deposit: Deposit;
let getWallet: GetWallet;
let accountGateway: AccountGatewayHTTP;
let walletRepository: WalletRepositoryORM;

let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  Registry.getInstance().register("orm", new ORM());

  pgPromiseAdapter = new PGPromiseAdapter();
  walletRepository = new WalletRepositoryORM();
  deposit = new Deposit();
  getWallet = new GetWallet();
  accountGateway = new AccountGatewayHTTP();

  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("walletRepository", walletRepository);
  Registry.getInstance().register("deposit", deposit);
  Registry.getInstance().register("getWallet", getWallet);
  Registry.getInstance().register("accountGateway", accountGateway);

});

afterEach(async () => {
  await walletRepository.clear();
  await pgPromiseAdapter.close();
  Registry.getInstance().dependencies.clear();
});

describe("Deposit", () => {
  test("Deve criar um deposito", async () => {
    const accountInput = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const accountOutput = await accountGateway.signup(accountInput);

    const fundInput = {
      accountId: accountOutput.accountId,
      assetId: "BTC",
      quantity: 1000
    }

    await deposit.execute(fundInput);
    const getAccountOutput = await getWallet.execute(accountOutput.accountId);

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
