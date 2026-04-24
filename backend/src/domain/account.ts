import { Balance } from "./balance";

import { UUID } from "./uuid";
import { Email } from "./email";
import { Password } from "./password";
import { Document } from "./document";
import { Name } from "./name";

export class Account {
  newMovements: Balance[] = [];

  private accountId: UUID;
  private name: Name;
  private email: Email;
  private password: Password;
  private document: Document;

  constructor(
    accountId: string,
    name: string,
    email: string,
    password: string,
    document: string,
    readonly balances: Balance[],
  ) {
    this.accountId = new UUID(accountId);
    this.name = new Name(name);
    this.email = new Email(email);
    this.password = new Password(password);
    this.document = new Document(document);
  }

  static create(name: string, email: string, password: string, document: string, balances: Balance[] = []) {
    const accountId = UUID.create();

    return new Account(accountId.value, name, email, password, document, balances);
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

  getName() {
    return this.name.value;
  }

  getAccountId() {
    return this.accountId.value;
  }

  getEmail() {
    return this.email.value;
  }

  getPassword() {
    return this.password.value;
  }

  getDocument() {
    return this.document.value;
  }
}
