import { Order } from "../order";
import { Event } from "./event";

export class OrderPlacedEvent extends Event<Order> {
  constructor(private readonly order: Order) {
    super("order-placed");
  }

  getPayload(): Order {
    return this.order;
  }
}
