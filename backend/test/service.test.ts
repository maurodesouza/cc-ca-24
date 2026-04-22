import { getAccount, signup } from "../src/service";

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

describe("Account", () => {
  test("Deve criar uma conta", async () => {
    const input = { ...validInput }

    const signupOutput = await signup(input);
    const getAccountOutput = await getAccount(signupOutput.accountId);

    expect(getAccountOutput.account_id).toBe(signupOutput.accountId);
    expect(getAccountOutput.name).toBe(input.name);
    expect(getAccountOutput.email).toBe(input.email);
    expect(getAccountOutput.document).toBe(input.document);
  });

  test("Não deve criar conta com nome invalido", async () => {
    const input = {
      ...validInput,
      name: "John",
    }

    await expect(() => signup(input)).rejects.toThrow("Invalid name")
  })

  test("Não deve criar conta com email invalido", async () => {
    const input = {
      ...validInput,
      email: "john.doe"
    }

    await expect(() => signup(input)).rejects.toThrow("Invalid email")
  })

  test("Não deve criar conta com senha invalida", async () => {
    const input = {
      ...validInput,
      password: "1234567"
    }

    await expect(() => signup(input)).rejects.toThrow("Invalid password")
  })

  test("Não deve criar conta com documento invalido", async () => {
    const input = {
      ...validInput,
      document: "11111"
    }

    await expect(() => signup(input)).rejects.toThrow("Invalid document")
  })

  test("Deve retornar erro ao não encontar uma conta", async () => {
    await expect(() => getAccount(crypto.randomUUID())).rejects.toThrow("Account not found")
  })
});
