import sinon from "sinon";

import { AccountService } from "../src/account-service";
import { AccountDAOInMemory } from "../src/account-DAO";

import * as mailer from "../src/mailer";

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

  test("Deve criar uma conta com stub", async () => {
    const mailerStub = sinon.stub(mailer, "sendEmail").resolves();

    const input = { ...validInput }

    const signupOutput = await accountService.signup(input);
    const getAccountOutput = await accountService.getAccount(signupOutput.accountId);

    expect(getAccountOutput.accountId).toBe(signupOutput.accountId);
    expect(getAccountOutput.name).toBe(input.name);
    expect(getAccountOutput.email).toBe(input.email);
    expect(getAccountOutput.document).toBe(input.document);

    mailerStub.restore();
  });

  test("Deve criar uma conta com spy", async () => {
    const mailerSpy = sinon.spy(mailer, "sendEmail");

    const input = { ...validInput }

    const signupOutput = await accountService.signup(input);
    const getAccountOutput = await accountService.getAccount(signupOutput.accountId);

    expect(getAccountOutput.accountId).toBe(signupOutput.accountId);
    expect(getAccountOutput.name).toBe(input.name);
    expect(getAccountOutput.email).toBe(input.email);
    expect(getAccountOutput.document).toBe(input.document);

    expect(mailerSpy.calledOnce).toBe(true);
    expect(mailerSpy.calledWith({
      to: input.email,
      subject: "Account created",
      body: "Your account has been created"
    })).toBe(true);

    mailerSpy.restore();
  });

  test("Deve criar uma conta com mock", async () => {
    const mailerMock = sinon.mock(mailer);

    mailerMock
      .expects("sendEmail")
      .once()
      .withArgs({
        to: validInput.email,
        subject: "Account created",
        body: "Your account has been created"
      })
      .resolves();

    const input = { ...validInput }

    const signupOutput = await accountService.signup(input);
    const getAccountOutput = await accountService.getAccount(signupOutput.accountId);

    expect(getAccountOutput.accountId).toBe(signupOutput.accountId);
    expect(getAccountOutput.name).toBe(input.name);
    expect(getAccountOutput.email).toBe(input.email);
    expect(getAccountOutput.document).toBe(input.document);

    mailerMock.verify()
    mailerMock.restore();
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
