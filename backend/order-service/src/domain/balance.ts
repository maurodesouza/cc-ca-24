import { Quantity } from "./quantity";

const VALID_ASSETS = ["BTC", "USD"];

export class Balance {
  private assetId: string;
  private quantity: Quantity;
  private blockedQuantity: Quantity;

  constructor(
    assetId: string,
    quantity: number,
    blockedQuantity: number,
  ) {
    if (!Balance.isValidAssetId(assetId)) throw new Error("Invalid asset ID");

    this.assetId = assetId;
    this.quantity = new Quantity(quantity);
    this.blockedQuantity = new Quantity(blockedQuantity);
  }

  static create(assetId: string, quantity: number, blockedQuantity: number = 0) {
    return new Balance(assetId, quantity, blockedQuantity);
  }

  private static isValidAssetId(assetId: string) {
    return VALID_ASSETS.includes(assetId);
  }

  deposit(quantity: number) {
    const quantityObj = new Quantity(quantity);
    this.quantity = this.quantity.add(quantityObj);
  }

  withdraw(quantity: number) {
    const quantityObj = new Quantity(quantity);

    if (this.getAvailableQuantity() < quantity) throw new Error("Insufficient funds");

    this.quantity = this.quantity.subtract(quantityObj);
  }

  block(quantity: number) {
    const quantityObj = new Quantity(quantity);


    if (this.getAvailableQuantity() < quantity) throw new Error("Insufficient funds");

    this.blockedQuantity = this.blockedQuantity.add(quantityObj);
  }

  unblock(quantity: number) {
    const quantityObj = new Quantity(quantity);

    if (this.blockedQuantity.getValue() < quantity) throw new Error("Insufficient blocked funds");

    this.blockedQuantity = this.blockedQuantity.subtract(quantityObj);
  }

  getAvailableQuantity() {
    return this.quantity.getValue() - this.blockedQuantity.getValue();
  }

  getAssetId() {
    return this.assetId;
  }

  getQuantity() {
    return this.quantity.getValue();
  }

  getBlockedQuantity() {
    return this.blockedQuantity.getValue();
  }
}
