import { GetAccount } from "../src/get-account";
import { AccountDAODatabase } from "../src/account-DAO";
import { SignUp } from "../src/signup";

let getAccount: GetAccount;
let signUp: SignUp;

beforeEach(() => {
  const accountDAO = new AccountDAODatabase();
  getAccount = new GetAccount(accountDAO);
  signUp = new SignUp(accountDAO);
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
