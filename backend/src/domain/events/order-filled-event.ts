import { Event } from "./event";
import { Order } from "../order";

export class OrderFilledEvent extends Event<Order> {
  constructor(private readonly order: Order) {
    super("order-filled");
  }

  getPayload(): Order {
    return this.order;
  }
}
