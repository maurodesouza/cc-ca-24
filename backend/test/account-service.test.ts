import { AccountService } from "../src/account-service";
import { AccountDAOInMemory } from "../src/account-DAO";

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

let accountService: AccountService;

beforeEach(() => {
  const accountDAO = new AccountDAOInMemory();
  accountService = new AccountService(accountDAO);
});

describe("Account", () => {
  test("Deve criar uma conta", async () => {
    const input = { ...validInput }

    const signupOutput = await accountService.signup(input);
    const getAccountOutput = await accountService.getAccount(signupOutput.accountId);

    expect(getAccountOutput.accountId).toBe(signupOutput.accountId);
    expect(getAccountOutput.name).toBe(input.name);
    expect(getAccountOutput.email).toBe(input.email);
    expect(getAccountOutput.document).toBe(input.document);
  });

  test("Não deve criar conta com nome invalido", async () => {
    const input = {
      ...validInput,
      name: "John",
    }

    await expect(() => accountService.signup(input)).rejects.toThrow("Invalid name")
  })

  test("Não deve criar conta com email invalido", async () => {
    const input = {
      ...validInput,
      email: "john.doe"
    }

    await expect(() => accountService.signup(input)).rejects.toThrow("Invalid email")
  })

  test("Não deve criar conta com senha invalida", async () => {
    const input = {
      ...validInput,
      password: "1234567"
    }

    await expect(() => accountService.signup(input)).rejects.toThrow("Invalid password")
  })

  test("Não deve criar conta com documento invalido", async () => {
    const input = {
      ...validInput,
      document: "11111"
    }

    await expect(() => accountService.signup(input)).rejects.toThrow("Invalid document")
  })

  test("Deve retornar erro ao não encontar uma conta", async () => {
    await expect(() => accountService.getAccount(crypto.randomUUID())).rejects.toThrow("Account not found")
  })
});
