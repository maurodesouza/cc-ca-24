import { Event } from "./event";
import { Order } from "../order";

export class OrderFilledEvent extends Event {
  constructor(private readonly order: Order) {
    super("order-filled");
  }

  getPayload<T>(): T {
    return this.order as T;
  }
}
