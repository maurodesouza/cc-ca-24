import { Book } from "../../domain/book";
import { inject } from "../../infra/utils/registry";
import { Queue } from "../../application/queue/queue";
import { OrderFilledEvent } from "../../domain/events/order-filled-event";

export class OrderFilledPublisher {
  @inject("book")
  private readonly book!: Book;
  @inject("queue")
  private readonly queue!: Queue;

  constructor() {
    this.book.register(OrderFilledEvent, this.handle.bind(this))
  }

  async handle(event: OrderFilledEvent) {
    const payload = event.getPayload()

    await this.queue.publish("matching-engine.events", payload, { routingKey: "matching-engine.order-filled" });
  }
}
