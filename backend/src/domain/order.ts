import { UUID } from "./uuid";

export class Order {
  private orderId: UUID;
  private accountId: UUID;
  private marketId: string;
  private side: string;
  private quantity: number;
  private price: number;
  private fillQuantity: number;
  private fillPrice: number;
  private status: string;
  private timestamp: Date;

  constructor(
    orderId: string,
    accountId: string,
    marketId: string,
    side: string,
    quantity: number,
    price: number,
    fillQuantity: number,
    fillPrice: number,
    status: string,
    timestamp: Date,
  ) {
    this.orderId = new UUID(orderId);
    this.accountId = new UUID(accountId);
    this.marketId = marketId;
    this.side = side;
    this.quantity = quantity;
    this.price = price;
    this.fillQuantity = fillQuantity;
    this.fillPrice = fillPrice;
    this.status = status;
    this.timestamp = timestamp;
  }

  static create(
    accountId: string,
    marketId: string,
    side: string,
    quantity: number,
    price: number,
    fillQuantity: number = 0,
    fillPrice: number = 0,
    status: string = "open",
    timestamp: Date = new Date(),
  ) {
    const orderId = UUID.create();
    return new Order(
      orderId.value,
      accountId,
      marketId,
      side,
      quantity,
      price,
      fillQuantity,
      fillPrice,
      status,
      timestamp,
    );
  }

  getOrderId() {
    return this.orderId.value;
  }

  getAccountId() {
    return this.accountId.value;
  }

  getMarketId() {
    return this.marketId;
  }

  getSide() {
    return this.side;
  }

  getQuantity() {
    return this.quantity;
  }

  getPrice() {
    return this.price;
  }

  getFillQuantity() {
    return this.fillQuantity;
  }

  getFillPrice() {
    return this.fillPrice;
  }

  getStatus() {
    return this.status;
  }

  getTimestamp() {
    return this.timestamp;
  }
}
