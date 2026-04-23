import crypto from "crypto";

import { AccountRepository } from "./account-repository";
import { sendEmail } from "./mailer";
import { Account } from "./account";

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
  accountRepository: AccountRepository;

  constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  async execute(input: Input): Promise<Output> {
    const account = Account.create(
      input.name,
      input.email,
      input.password,
      input.document
    );

    await this.accountRepository.save(account);

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



