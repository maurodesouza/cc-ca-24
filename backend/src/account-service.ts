import crypto from "crypto";

import { isValidName } from "./is-valid-name";
import { isValidEmail } from "./is-valid-email";
import { isValidPassword } from "./is-valid-password";
import { isValidCpf } from "./is-valid-cpf";
import { AccountDAO } from "./account-DAO";

export class AccountService {
  accountDAO: AccountDAO;

  constructor(accountDAO: AccountDAO) {
    this.accountDAO = accountDAO;
  }

  async signup(input: any) {
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

    return account
  }

  async getAccount(accountId: string) {
    const account = await this.accountDAO.getById(accountId);

    if (!account) {
      throw new Error("Account not found");
    }

    return account;
  }
}



