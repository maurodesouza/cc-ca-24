import { GetAccount } from "../../src/application/use-cases/get-account";
import { SignUp } from "../../src/application/use-cases/signup";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { AccountRepositoryORM } from "../../src/infra/repository/account-repository";
import { Registry } from "../../src/infra/di/registry";
import { ORM } from "../../src/infra/orm/orm";

let getAccount: GetAccount;
let signUp: SignUp;
let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("accountRepository", new AccountRepositoryORM());
  Registry.getInstance().register("getAccount", new GetAccount());
  Registry.getInstance().register("signUp", new SignUp());

  getAccount = new GetAccount();
  signUp = new SignUp();
});

afterEach(async () => {
  Registry.getInstance().dependencies.clear();
  await pgPromiseAdapter.close();
});

describe("GetAccount", () => {
  test("Deve obter uma conta", async () => {
    const input = {
      name: "John Doe",
      email: "john.doe@example.com",
      document: "85486231016",
      password: "Password123"
    }

    const signupOutput = await signUp.execute(input);
    const getAccountOutput = await getAccount.execute(signupOutput.accountId);

    expect(getAccountOutput.accountId).toBe(signupOutput.accountId);
    expect(getAccountOutput.name).toBe(input.name);
    expect(getAccountOutput.email).toBe(input.email);
    expect(getAccountOutput.document).toBe(input.document);
  });

  test("Deve retornar erro ao não encontar uma conta", async () => {
    await expect(() => getAccount.execute(crypto.randomUUID())).rejects.toThrow("Account not found")
  });
});
