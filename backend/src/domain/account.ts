import { Balance } from "./balance";

import { UUID } from "./uuid";
import { Email } from "./email";
import { Password } from "./password";
import { Document } from "./document";
import { Name } from "./name";
import { Order } from "./order";

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
    if (quantity <= 0) throw new Error("Invalid quantity")
    const balance = this.balances.find((balance: Balance) => balance.getAssetId() === assetId);
    if (balance) balance.deposit(quantity);
    else this.balances.push(Balance.create(assetId, quantity));
  }

  withdraw(assetId: string, quantity: number) {
    if (quantity <= 0) throw new Error("Invalid quantity")
    const balance = this.balances.find((balance: Balance) => balance.getAssetId() === assetId);
    if (!balance) throw new Error("Insufficient funds");
    balance.withdraw(quantity);
  }

  getBalanceByAssetId(assetId: string): Balance | undefined {
    return this.balances.find((balance: Balance) => balance.getAssetId() === assetId);
  }

  getAvailableBalanceByAssetId(assetId: string): number {
    const balance = this.getBalanceByAssetId(assetId);

    if (!balance) return 0;
    return balance.getAvailableQuantity();
  }

  blockOrder(order: Order) {
    const { mainAsset, paymentAsset } = order.getMainAndPaymentAssets();

    const isBuy = order.isBuy();
    const assetId = isBuy ? paymentAsset : mainAsset;
    const quantity = isBuy ? order.getQuantity() * order.getPrice() : order.getQuantity();

    const balance = this.getBalanceByAssetId(assetId);
    if (!balance || balance.getAvailableQuantity() < quantity) return false;

    balance.block(quantity);
    return true;
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
