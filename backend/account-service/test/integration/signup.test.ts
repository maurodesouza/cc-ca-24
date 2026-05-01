import sinon from "sinon";

import { SignUp } from "../../src/application/use-cases/signup";
import { AccountRepositoryORM } from "../../src/infra/repository/account-repository";
import { PGPromiseAdapter } from "../../src/infra/database/pg-promise-adapter";
import { Registry } from "../../src/infra/utils/registry";
import { ORM } from "../../src/infra/orm/orm";

import { Queue } from "../../src/application/queue/queue";
import { Mail } from "../../src/application/mail/mail";

const validInput = {
  name: "John Doe",
  email: "john.doe@example.com",
  document: "85486231016",
  password: "Password123"
}

let queueMock: Partial<Queue>
let mailerMock: Partial<Mail>

let signUp: SignUp;
let pgPromiseAdapter: PGPromiseAdapter;

beforeEach(() => {
  pgPromiseAdapter = new PGPromiseAdapter();
  signUp = new SignUp();

  queueMock = {
    publish: jest.fn().mockResolvedValue(undefined)
  }

  mailerMock = {
    send: jest.fn().mockResolvedValue(undefined)
  }

  Registry.getInstance().register("databaseConnection", pgPromiseAdapter);
  Registry.getInstance().register("orm", new ORM());
  Registry.getInstance().register("accountRepository", new AccountRepositoryORM());
  Registry.getInstance().register("signUp", signUp);
  Registry.getInstance().register("queue", queueMock);
  Registry.getInstance().register("mailer", mailerMock);
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

    expect(queueMock.publish).toHaveBeenCalledWith("account.events", expect.objectContaining({
      accountId: signupOutput.accountId,
      email: signupOutput.email,
    }), { routingKey: "account.created" });

    expect(mailerMock.send).toHaveBeenCalledWith(expect.objectContaining({
      to: signupOutput.email,
      subject: "Welcome to our platform!",
    }));
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
