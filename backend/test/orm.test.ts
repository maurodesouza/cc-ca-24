import { Deposit } from "../src/application/use-cases/deposit";
import { GetAccount } from "../src/application/use-cases/get-account";
import { SignUp } from "../src/application/use-cases/signup";
import { Account } from "../src/domain/account";
import { PGPromiseAdapter } from "../src/infra/database/pg-promise-adapter";
import { Registry } from "../src/infra/di/registry";
import { AccountModel } from "../src/infra/orm/models/account-model";
import { ORM } from "../src/infra/orm/orm";
import { AccountRepositoryORM } from "../src/infra/repository/account-repository";
import { WalletRepositoryDatabase } from "../src/infra/repository/wallet-repository";

const validAccount = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

let connection: PGPromiseAdapter;
let accountRepository: AccountRepositoryORM
let orm: ORM

beforeEach(() => {
  connection = new PGPromiseAdapter();
  accountRepository = new AccountRepositoryORM();
  orm = new ORM();

  Registry.getInstance().register("databaseConnection", connection);
  Registry.getInstance().register("orm", orm);
});

afterEach(async () => {
  Registry.getInstance().dependencies.clear();
  await connection.close();
})

describe("ORM", () => {
  test("Deve testar o ORM", async () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document);
    const accountModel = AccountModel.fromEntity(account);

    await orm.save(accountModel)
    const persistedAccount = await orm.getUnique(AccountModel, { where: { account_id: account.getAccountId() } })

    expect(persistedAccount).toBeDefined()
    expect(persistedAccount?.accountId).toBe(account.getAccountId())
    expect(persistedAccount?.name).toBe(account.getName())
    expect(persistedAccount?.email).toBe(account.getEmail())
    expect(persistedAccount?.document).toBe(account.getDocument())
    expect(persistedAccount?.password).toBe(account.getPassword())
  })

  test("Deve testar o account repository", async () => {
    const account = Account.create(validAccount.name, validAccount.email, validAccount.password, validAccount.document);

    await accountRepository.save(account)
    const persistedAccount = await accountRepository.getById(account.getAccountId())

    expect(persistedAccount.getAccountId()).toBe(account.getAccountId())
    expect(persistedAccount.getName()).toBe(account.getName())
    expect(persistedAccount.getEmail()).toBe(account.getEmail())
    expect(persistedAccount.getDocument()).toBe(account.getDocument())
    expect(persistedAccount.getPassword()).toBe(account.getPassword())
  })
})
