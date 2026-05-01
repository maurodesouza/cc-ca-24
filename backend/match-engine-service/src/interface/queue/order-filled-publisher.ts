import { Book } from "../../domain/book";
import { inject } from "../../infra/utils/registry";
import { RabbitMQAdapter } from "../../infra/queue/rabbitmq-adapter";
import { OrderFilledEvent } from "../../domain/events/order-filled-event";

export class OrderFilledPublisher {
  @inject("book")
  private readonly book!: Book;
  @inject("queue")
  private readonly queue!: RabbitMQAdapter;

  constructor() {
    this.book.register(OrderFilledEvent, this.handle.bind(this))
  }

  async handle(event: OrderFilledEvent) {
    const order = event.getPayload()

    const input = {
      orderId: order.getOrderId(),
      accountId: order.getAccountId(),
      marketId: order.getMarketId(),
      side: order.getSide(),
      quantity: order.getQuantity(),
      price: order.getPrice(),
      fillQuantity: order.getFillQuantity(),
      fillPrice: order.getFillPrice(),
      status: order.getStatus(),
      timestamp: order.getTimestamp(),
    };

    await this.queue.publish("order-filled", input);
  }
}
