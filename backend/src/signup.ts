import crypto from "crypto";

import { isValidName } from "./is-valid-name";
import { isValidEmail } from "./is-valid-email";
import { isValidPassword } from "./is-valid-password";
import { isValidCpf } from "./is-valid-cpf";
import { AccountDAO } from "./account-DAO";
import { sendEmail } from "./mailer";

type Input = {
  name: string;
  email: string;
  password: string;
  document: string;
}

type Output = {
  accountId: string;
  name: string;
  email: string;
  password: string;
  document: string;
}

export class SignUp {
  accountDAO: AccountDAO;

  constructor(accountDAO: AccountDAO) {
    this.accountDAO = accountDAO;
  }

  async execute(input: Input): Promise<Output> {
    const account = {
      accountId: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      password: input.password,
      document: input.document
    }

    if (!isValidName(account.name)) {
      throw new Error("Invalid name");
    }

    if (!isValidEmail(account.email)) {
      throw new Error("Invalid email");
    }

    if (!isValidPassword(account.password)) {
      throw new Error("Invalid password");
    }

    if (!isValidCpf(account.document)) {
      throw new Error("Invalid document");
    }

    await this.accountDAO.save(account);

    await sendEmail({
      to: account.email,
      subject: "Account created",
      body: "Your account has been created"
    });

    const output = {
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      password: account.password,
      document: account.document,
    }

    return output
  }
}



