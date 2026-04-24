import { Balance } from "./balance";

import { isValidCpf } from "./is-valid-cpf";
import { isValidName } from "./is-valid-name";
import { isValidEmail } from "./is-valid-email";
import { isValidPassword } from "./is-valid-password";

export class Account {
  newMovements: Balance[] = [];

  constructor(
    public readonly accountId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly document: string,
    public readonly balances: Balance[],
  ) {
    if (!isValidName(this.name)) {
      throw new Error("Invalid name");
    }

    if (!isValidEmail(this.email)) {
      throw new Error("Invalid email");
    }

    if (!isValidPassword(this.password)) {
      throw new Error("Invalid password");
    }

    if (!isValidCpf(this.document)) {
      throw new Error("Invalid document");
    }
  }

  static create( name: string, email: string, password: string, document: string, balances: Balance[] = []) {
    const accountId = crypto.randomUUID();

    return new Account(accountId, name, email, password, document, balances);
  }

  deposit(assetId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    const balance = Balance.create(assetId, quantity);
    this.balances.push(balance);
    this.newMovements.push(balance);
  }

  withdraw(assetId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error("Invalid quantity");
    }

    const accountBalance = this.getBalance(assetId);

    if (accountBalance < quantity) {
      throw new Error("Insufficient funds");
    }

    const balance = Balance.create(assetId, -quantity);
    this.balances.push(balance);
    this.newMovements.push(balance);
  }

  getBalance(assetId: string): number {
    return this.balances
      .filter(b => b.assetId === assetId)
      .reduce((acc, b) => acc + b.quantity, 0);
  }
}
