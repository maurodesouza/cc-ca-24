import { Order } from "../order";
import { Event } from "./event";

export class OrderPlacedEvent extends Event {
  constructor(private readonly order: Order) {
    super("order-placed");
  }

  getPayload<T>(): T {
    return this.order as T;
  }
}
