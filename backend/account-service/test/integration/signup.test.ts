import sinon from "sinon";

import { SignUp } from "../../src/application/use-cases/signup";
import { AccountRepositoryORM } from "../../src/infra/repository/account-repository";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { Registry } from "../../src/infra/utils/registry";
import { ORM } from "../../src/infra/orm/orm";

import * as mailer from "../../src/infra/mail/mailer";

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

let signUp: SignUp;
let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("accountRepository", new AccountRepositoryORM());
  Registry.getInstance().register("signUp", new SignUp());

  signUp = new SignUp();
});

afterEach(async () => {
  Registry.getInstance().dependencies.clear();
  await pgPromiseAdapter.close();
});

describe("SignUp", () => {
  test("Deve criar uma conta", async () => {
    const input = { ...validInput }

    const signupOutput = await signUp.execute(input);

    expect(signupOutput.accountId).toBeDefined();
    expect(signupOutput.name).toBe(input.name);
    expect(signupOutput.email).toBe(input.email);
    expect(signupOutput.document).toBe(input.document);
  });

  test("Deve criar uma conta com stub", async () => {
    const mailerStub = sinon.stub(mailer, "sendEmail").resolves();

    const input = { ...validInput }

    const signupOutput = await signUp.execute(input);

    expect(signupOutput.accountId).toBeDefined();
    expect(signupOutput.name).toBe(input.name);
    expect(signupOutput.email).toBe(input.email);
    expect(signupOutput.document).toBe(input.document);

    mailerStub.restore();
  });

  test("Deve criar uma conta com spy", async () => {
    const mailerSpy = sinon.spy(mailer, "sendEmail");

    const input = { ...validInput }

    const signupOutput = await signUp.execute(input);

    expect(signupOutput.accountId).toBeDefined();
    expect(signupOutput.name).toBe(input.name);
    expect(signupOutput.email).toBe(input.email);
    expect(signupOutput.document).toBe(input.document);

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

    const signupOutput = await signUp.execute(input);

    expect(signupOutput.accountId).toBeDefined();
    expect(signupOutput.name).toBe(input.name);
    expect(signupOutput.email).toBe(input.email);
    expect(signupOutput.document).toBe(input.document);

    mailerMock.verify()
    mailerMock.restore();
  });

  test("Não deve criar conta com nome invalido", async () => {
    const input = {
      ...validInput,
      name: "John",
    }

    await expect(() => signUp.execute(input)).rejects.toThrow("Invalid name")
  })

  test("Não deve criar conta com email invalido", async () => {
    const input = {
      ...validInput,
      email: "john.doe"
    }

    await expect(() => signUp.execute(input)).rejects.toThrow("Invalid email")
  })

  test("Não deve criar conta com senha invalida", async () => {
    const input = {
      ...validInput,
      password: "1234567"
    }

    await expect(() => signUp.execute(input)).rejects.toThrow("Invalid password")
  })

  test("Não deve criar conta com documento invalido", async () => {
    const input = {
      ...validInput,
      document: "11111"
    }

    await expect(() => signUp.execute(input)).rejects.toThrow("Invalid document")
  })
});
