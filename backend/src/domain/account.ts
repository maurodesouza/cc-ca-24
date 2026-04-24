import { Balance } from "./balance";

import { UUID } from "./uuid";
import { Email } from "./email";
import { Password } from "./password";
import { Document } from "./document";
import { Name } from "./name";

export class Account {
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
    console.log("constructor passowrd", password)


    this.accountId = new UUID(accountId);
    this.name = new Name(name);
    this.email = new Email(email);
    this.password = new Password(password);
    this.document = new Document(document);
  }

  static create(name: string, email: string, password: string, document: string, balances: Balance[] = []) {
    const accountId = UUID.create();

    console.log("crewate passowrd", password)

    return new Account(accountId.value, name, email, password, document, balances);
  }

  deposit(assetId: string, quantity: number) {
    if (quantity <= 0) throw new Error("Invalid quantity")
    const existingBalance = this.balances.find((balance: Balance) => balance.assetId === assetId);
    if (existingBalance) existingBalance.quantity += quantity;
    else this.balances.push(new Balance(assetId, quantity));
  }

  withdraw(assetId: string, quantity: number) {
    if (quantity <= 0) throw new Error("Invalid quantity")
    const existingBalance = this.balances.find((balance: Balance) => balance.assetId === assetId);
    if (!existingBalance) throw new Error("Insufficient funds");
    const newQuantity = existingBalance.quantity - quantity
    if (newQuantity < 0) throw new Error("Insufficient funds");
    existingBalance.quantity = newQuantity;
  }

  getBalance(assetId: string): number {
    const existingBalance = this.balances.find((balance: Balance) => balance.assetId === assetId);
    if (!existingBalance) return 0;
    return existingBalance.quantity;
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
