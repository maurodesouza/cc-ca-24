import { Event } from "./event";
import { Order } from "../order";

type EventPayload = {
  orderId: string;
  accountId: string;
  marketId: string;
  side: string;
  quantity: number;
  price: number;
  fillQuantity: number;
  fillPrice: number;
  status: string;
  timestamp: Date;

  fillDiff: number
}
export class OrderFilledEvent extends Event<EventPayload> {
  constructor(private readonly order: Order, private readonly fillDiff: number) {
    super("order-filled");
  }

  getPayload(): EventPayload {
    return {
      orderId: this.order.getOrderId(),
      accountId: this.order.getAccountId(),
      marketId: this.order.getMarketId(),
      side: this.order.getSide(),
      quantity: this.order.getQuantity(),
      price: this.order.getPrice(),
      fillQuantity: this.fillDiff,
      fillPrice: this.order.getPrice(),
      status: this.order.getStatus(),
      timestamp: this.order.getTimestamp(),

      fillDiff: this.fillDiff,
    };
  }
}
