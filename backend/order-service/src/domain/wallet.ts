import { Balance } from "./balance";
import { Order } from "./order";
import { UUID } from "./uuid";

export class Wallet {
  readonly accountId: UUID;
  readonly balances: Balance[];

  constructor(accountId: string, balances: Balance[]) {
    this.accountId = new UUID(accountId);
    this.balances = balances;
  }

  static create(accountId: string, balances: Balance[] = []) {
    return new Wallet(accountId, balances);
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

  getAccountId() {
    return this.accountId.value;
  }
}
