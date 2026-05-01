import { Withdraw } from "../../src/application/use-cases/withdraw";
import { Deposit } from "../../src/application/use-cases/deposit";
import { GetWallet } from "../../src/application/use-cases/get-wallet";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { WalletRepositoryORM } from "../../src/infra/repository/wallet-repository";
import { AccountReferenceRepository } from "../../src/infra/repository/account-reference-repository";
import { Registry } from "../../src/infra/utils/registry";
import { ORM } from "../../src/infra/orm/orm";

let withdraw: Withdraw;
let deposit: Deposit;
let getWallet: GetWallet;
let accountReferenceRepository: jest.Mocked<Pick<AccountReferenceRepository, 'exist'>>;
let pgPromiseAdapter: PGPromiseAdapter;
let walletRepository: WalletRepositoryORM;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  walletRepository = new WalletRepositoryORM();
  accountReferenceRepository = {
    exist: jest.fn() as jest.MockedFunction<(accountId: string) => Promise<boolean>>
  }
  withdraw = new Withdraw();
  deposit = new Deposit();
  getWallet = new GetWallet();

  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("walletRepository", walletRepository);
  Registry.getInstance().register("accountReferenceRepository", accountReferenceRepository);
  Registry.getInstance().register("withdraw", withdraw);
  Registry.getInstance().register("deposit", deposit);
  Registry.getInstance().register("getWallet", getWallet);
});

afterEach(async () => {
  await walletRepository.clear();
  await pgPromiseAdapter.close();
  Registry.getInstance().dependencies.clear();
});

describe("Withdraw", () => {
  test("Deve criar um saque", async () => {
    accountReferenceRepository.exist.mockResolvedValue(true);
    const accountId = crypto.randomUUID();

    const depositInput = {
      accountId: accountId,
      assetId: "BTC",
      quantity: 500
    }

    await deposit.execute(depositInput);

    const withdrawInput = {
      accountId: accountId,
      assetId: "BTC",
      quantity: 400
    }

    await withdraw.execute(withdrawInput);

    const getAccountOutput = await getWallet.execute(accountId);

    expect(getAccountOutput.balances[0].assetId).toBe(withdrawInput.assetId);
    expect(getAccountOutput.balances[0].quantity).toBe(100);
  });

  test("Não deve criar um saque com conta inexistente", async () => {
    accountReferenceRepository.exist.mockResolvedValue(false);

    const fundInput = {
      accountId: crypto.randomUUID(),
      assetId: "BTC",
      quantity: 1000
    }

    await expect(() => withdraw.execute(fundInput)).rejects.toThrow("Account not found");
  });

  test("Não deve criar um saque sem um deposito previo", async () => {
    accountReferenceRepository.exist.mockResolvedValue(true);
    const accountId = crypto.randomUUID();

    const withdrawInput = {
      accountId: accountId,
      assetId: "BTC",
      quantity: 1
    }

    await expect(() => withdraw.execute(withdrawInput)).rejects.toThrow("Insufficient funds");
  });

  test("Não deve criar um saque com saldo insuficiente", async () => {
    accountReferenceRepository.exist.mockResolvedValue(true);
    const accountId = crypto.randomUUID();

    const depositInputs = [
      {
        accountId: accountId,
        assetId: "BTC",
        quantity: 200
      },
      {
        accountId: accountId,
        assetId: "BTC",
        quantity: 300
      },
    ]

    for (const input of depositInputs) {
      await deposit.execute(input);
    }

    const withdrawInput = {
      accountId: accountId,
      assetId: "BTC",
      quantity: 501
    }

    await expect(() => withdraw.execute(withdrawInput)).rejects.toThrow("Insufficient funds");
  });
});
