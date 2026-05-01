import { Deposit } from "../../src/application/use-cases/deposit";
import { GetWallet } from "../../src/application/use-cases/get-wallet";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { WalletRepositoryORM } from "../../src/infra/repository/wallet-repository";
import { AccountReferenceRepository } from "../../src/infra/repository/account-reference-repository";
import { Registry } from "../../src/infra/utils/registry";
import { ORM } from "../../src/infra/orm/orm";

let deposit: Deposit;
let getWallet: GetWallet;
let walletRepository: WalletRepositoryORM;
let accountReferenceRepository: jest.Mocked<Pick<AccountReferenceRepository, 'exist'>>;

let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  Registry.getInstance().register("orm", new ORM());

  pgPromiseAdapter = new PGPromiseAdapter();

  walletRepository = new WalletRepositoryORM();
  accountReferenceRepository = {
    exist: jest.fn() as jest.MockedFunction<(accountId: string) => Promise<boolean>>
  }

  deposit = new Deposit();
  getWallet = new GetWallet();

  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("walletRepository", walletRepository);
  Registry.getInstance().register("accountReferenceRepository", accountReferenceRepository);
  Registry.getInstance().register("deposit", deposit);
  Registry.getInstance().register("getWallet", getWallet);

});

afterEach(async () => {
  await walletRepository.clear();
  await pgPromiseAdapter.close();
  Registry.getInstance().dependencies.clear();
});

describe("Deposit", () => {
  test("Deve criar um deposito", async () => {
    const accountId = crypto.randomUUID();
    accountReferenceRepository.exist.mockResolvedValue(true);

    const fundInput = {
      accountId: accountId,
      assetId: "BTC",
      quantity: 1000
    }

    await deposit.execute(fundInput);
    const getAccountOutput = await getWallet.execute(accountId);

    expect(getAccountOutput.balances[0].assetId).toBe(fundInput.assetId);
    expect(getAccountOutput.balances[0].quantity).toBe(fundInput.quantity);
  });

  test("Não deve criar um deposito com conta inexistente", async () => {
    accountReferenceRepository.exist.mockResolvedValue(false);

    const fundInput = {
      accountId: crypto.randomUUID(),
      assetId: "BTC",
      quantity: 1000
    }

    await expect(() => deposit.execute(fundInput)).rejects.toThrow("Account not found");
  });
});
