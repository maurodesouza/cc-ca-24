import { Event } from "./event";

export class OrderPlacedEvent extends Event {
  constructor(private readonly marketId: string) {
    super("order-placed");
  }

  getPayload<T>(): T {
    return this.marketId as T;
  }
}
