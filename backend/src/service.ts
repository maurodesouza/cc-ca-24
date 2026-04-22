import crypto from "crypto";

import { isValidName } from "./is-valid-name";
import { isValidEmail } from "./is-valid-email";
import { isValidPassword } from "./is-valid-password";
import { isValidCpf } from "./is-valid-cpf";
import { saveAccount, getAccountById } from "./data";


export async function signup(input: any) {
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

  await saveAccount(account);

  return account
}

export async function getAccount(accountId: string) {
  const account = await getAccountById(accountId);

  if (!account) {
    throw new Error("Account not found");
  }

  return account;
}
